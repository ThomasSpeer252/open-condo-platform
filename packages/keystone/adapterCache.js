/**
 * Keystone database adapter level cache
 *
 * How it works:
 *
 * To understand how adapterCache works we need to understand the environment and the tasks that this feature solve
 * 1. Your web app has multiple instances, but single database
 * 2. You use Redis
 * 3. You need a mechanism to lower the number of SQL queries to your DB
 *
 * Adapter cache has two variables:
 *
 * State -- saved in redis and contains last date of update (update_time) on every GQL List.
 * State part example: { "User": "1669912192723" }
 *
 * Cache -- saved internally in instance.
 * Cache part example: { "User": { "where:{id:"1"},first:1": { result: <User>, updateTime: "1669912192723" } ] } }
 *
 * For every list patch listAdapter function:
 * If request to this list is Query:
 *  1. check if request is in cache
 *  2. check if cache last update time equals state last update time
 *  3. If both checks are passed:
 *      1. return value from cache
 *     Else:
 *     1. get value from DB
 *     2. update cache
 * If request to this list is Mutation (anything that mutates the data):
 *  1. update state on this list to the update time of the updated/created/deleted object
 *
 * Statistics:
 *  - If cache logging is turned on, then statistics is shown on any log event.
 *
 * Garbage collection:
 *  - Every request total number of keys in cache is checked. If total number of keys is greater than maxCacheKeys, keysToDelete with lowest score are deleted from cache.
 *
 * Notes:
 *  - Adapter level cache do not cache complex requests. A request is considered complex, if Where query contains other relationships
 *
 */

const { get, cloneDeep, isEqual, floor, flatten } = require('lodash')
const LRUCache = require('lru-cache')

const { getLogger } = require('./logging')
const { queryHasField } = require('./queryHasField')
const { getRedisClient } = require('./redis')

const UPDATED_AT_FIELD = 'updatedAt'
const STATE_REDIS_KEY_PREFIX = 'adapterCacheState'

const logger = getLogger('🔴 adapterCache')


class AdapterCache {

    constructor (config) {
        try {
            const parsedConfig = JSON.parse(config)

            this.enabled = !!get(parsedConfig, 'enable', false)

            // Redis is used as State:
            // Note: Redis installation is modified with custom commands. Check getStateRedisClient for details
            // State: { listName -> lastUpdate }
            this.redisClient = this.getStateRedisClient()

            // This mechanism allows to skip caching some lists.
            // Useful for hotfixes or disabling cache for business critical lists
            this.excludedLists = get(parsedConfig, 'excludedLists', [])

            // This mechanism allows to control garbage collection.
            this.maxCacheKeys = get(parsedConfig, 'maxCacheKeys', 1000)

            // Cache: { listName -> queryKey -> { response, lastUpdate, score } }
            this.cache = new LRUCache({ max: this.maxCacheKeys })

            // Logging allows to get the percentage of cache hits
            this.logging = get(parsedConfig, 'logging', false)

            this.totalRequests = 0
            this.cacheHits = 0

        } catch (e) {
            this.enabled = false
            logger.warn(`ADAPTER_CACHE: Bad config! reason ${e}`)
        }
    }

    /**
     * Sometimes we might get a situation when two instances try to update state with different timestamp values.
     * So, we might have two commands ordered to execute by internal redis queue:
     * 1. SET some_key 1670000000010
     * 2. SET some_key 1670000000009
     * In result (GET some_key) will equal 1670000000009, but the correct value is 1670000000010!
     * So to counter this we write custom redis function that will update value only if it is bigger!
     */
    getStateRedisClient () {
        const updateTimeStampFunction = {
            numberOfKeys: 1,
            lua: `
            local time = tonumber(ARGV[1])
            local old_time = tonumber(redis.call('GET', KEYS[1]))
            if (old_time == nil) then
                return redis.call('SET', KEYS[1], ARGV[1])
            end
            if (time > old_time) then
                return redis.call('SET', KEYS[1], ARGV[1])
            end
        ` }

        const redis = getRedisClient('adapterCacheState')
        redis.defineCommand('cacheUpdateStateTimestamp', updateTimeStampFunction)
        return redis
    }

    /**
     * Sets last updated list time to Redis storage
     * @param {string} listName -- List name
     * @param {Date} value -- Last updated time
     * @returns {Promise<void>}
     */
    async setState (listName, time) {
        const serializedTime = time.valueOf()
        const prefixedKey = `${STATE_REDIS_KEY_PREFIX}:${listName}`
        await this.redisClient.cacheUpdateStateTimestamp(prefixedKey, serializedTime)
    }

    /**
     * Returns last updated time by list from Redis
     * @param {string} listName -- List name
     * @returns {Promise<Date>}
     */
    async getState (listName) {
        const serializedTime = await this.redisClient.get(`${STATE_REDIS_KEY_PREFIX}:${listName}`)
        if (serializedTime) {
            const parsedTime = parseInt(serializedTime)
            if (!isNaN(parsedTime)) { return new Date(parsedTime) }
        }
        return null
    }

    setCache (listName, key, value) {
        value.listName = listName
        this.cache.set(key, value)
    }

    getCache (key) {
        return this.cache.get(key)
    }

    /**
     * Drops local cache on list
     * @param {string} listName
     */
    dropCacheByList (listName) {

        // We drop all cached items, that are associated with certain list!
        this.cache.forEach((cachedItem, key) => {
            if (get(cachedItem, 'listName') === listName) {
                this.cache.del(key)
            }
        })
    }

    /**
     * Get total number of requests
     * @returns {number}
     */
    getTotal () {
        return this.totalRequests
    }

    /**
     * Get total number of cache hits
     * @returns {number}
     */
    getHits () {
        return this.cacheHits
    }

    /**
     * Scores cache hit
     * @returns {number}
     */
    incrementHit () {
        return this.cacheHits++
    }

    /**
     * Used to score total requests
     * @returns {number}
     */
    incrementTotal () {
        return this.totalRequests++
    }

    /**
     * Logs cache event.
     * @param {Object} event
     */
    logEvent ( { type, functionName, listName, key, result } ) {
        if (!this.logging) return

        const cacheEvent = {
            type,
            functionName,
            listName,
            key,
            result,
            meta: {
                hits: this.getHits(),
                total: this.getTotal(),
                hitrate: floor(this.getHits() / this.getTotal(), 2),
                totalKeys: this.getCacheSize(),
            },
        }

        logger.info(cacheEvent)
    }

    /**
     * Calculate total size of items held in cache
     * @returns {number}
     */
    getCacheSize = () => {
        return this.cache.size
    }

    async prepareMiddleware ({ keystone, dev, distDir }) {
        if (this.enabled) {
            await patchKeystoneAdapterWithCacheMiddleware(keystone, this)
            logger.info('ADAPTER_CACHE: Adapter level cache ENABLED')
        } else {
            logger.info('ADAPTER_CACHE: Adapter level cache NOT ENABLED')
        }
    }
}

const getItemsQueryKey = ([args, opts]) => `${JSON.stringify(args)}_${get(opts, ['context', 'authedItem', 'id'])}`
const getItemsQueryCondition = ([args]) => get(args, ['where'])

const getFindKey = ([condition]) => `${JSON.stringify(condition)}`
const getFindCondition = ([condition]) => condition

const getFindByIdKey = ([id]) => `${id}`

const getFindAllKey = () => ''

const getFindOneKey = ([condition]) => `${JSON.stringify(condition)}`

/**
 * Patches an internal keystone adapter adding cache functionality
 * @param keystone
 * @param {AdapterCache} cacheAPI
 * @returns {Promise<void>}
 */
async function patchKeystoneAdapterWithCacheMiddleware (keystone, cacheAPI) {
    const keystoneAdapter = keystone.adapter

    const cache = cacheAPI.cache
    const excludedLists = cacheAPI.excludedLists

    const listAdapters = Object.values(keystoneAdapter.listAdapters)

    // Step 1: Preprocess lists.
    // Lists are reverse related if both of them have a relation to one another. Example: Books -> Author and Author -> Books
    const manyRelations = {}
    const relations = {}

    for (const listAdapter of listAdapters) {
        const listName = listAdapter.key
        for (const field of listAdapter.fieldAdapters) {
            if (field.fieldName === 'Relationship') {
                if (!relations[listName]) { relations[listName] = [] }
                relations[listName].push(field.refListKey)
                if (get(field, ['field', 'many'])) {
                    if (!manyRelations[listName]) { manyRelations[listName] = [] }
                    manyRelations[listName].push(field.refListKey)
                }
            }
        }
    }

    const dependantsOfManyRelations = new Set([...flatten(Object.values(manyRelations)), ...Object.keys(manyRelations)])

    logger.info({ relations, manyRelations })

    // Step 2: Iterate over lists, patch mutations and queries inside list.

    const enabledLists = []
    const disabledLists = []

    for (const listAdapter of listAdapters) {

        const listName = listAdapter.key
        cache[listName] = {}

        // Skip patching of the list if:

        // 1. No update at field!
        const fields = listAdapter.fieldAdaptersByPath
        if (!fields[UPDATED_AT_FIELD] || !fields[UPDATED_AT_FIELD]) {
            disabledLists.push({ listName, reason: `No ${UPDATED_AT_FIELD} field` })
            continue
        }

        // 2. It is specified in config
        if (excludedLists.includes(listName)) {
            disabledLists.push({ listName, reason: 'Cache is excluded by config' })
            continue
        }

        // 3. It is a dependent of many:true field.
        if (dependantsOfManyRelations.has(listName)) {
            disabledLists.push({ listName, reason: 'List is a dependant of many: true relation!' })
            continue
        }
        
        enabledLists.push(listName)

        // Patch public queries from BaseKeystoneList:

        const originalItemsQuery = listAdapter.itemsQuery
        listAdapter.itemsQuery = patchAdapterQueryFunction(listName, 'itemsQuery', originalItemsQuery, listAdapter, cacheAPI, getItemsQueryKey, getItemsQueryCondition, relations)

        const originalFind = listAdapter.find
        listAdapter.find = patchAdapterQueryFunction(listName, 'find', originalFind, listAdapter, cacheAPI, getFindKey, getFindCondition, relations)

        const originalFindById = listAdapter.findById
        listAdapter.findById = patchAdapterQueryFunction(listName, 'findById', originalFindById, listAdapter, cacheAPI, getFindByIdKey)

        const originalFindOne = listAdapter.findOne
        listAdapter.findOne = patchAdapterQueryFunction(listName, 'findOne', originalFindOne, listAdapter, cacheAPI, getFindOneKey, getFindCondition, relations)

        const originalFindAll = listAdapter.findAll
        listAdapter.findAll = patchAdapterQueryFunction(listName, 'findAll', originalFindAll, listAdapter, cacheAPI, getFindAllKey)

        // Patch mutations:

        const originalUpdate = listAdapter.update
        listAdapter.update = patchAdapterFunction(listName, 'update', originalUpdate, listAdapter, cacheAPI )

        const originalCreate = listAdapter.create
        listAdapter.create = patchAdapterFunction(listName, 'create', originalCreate, listAdapter, cacheAPI )

        const originalDelete = listAdapter.delete
        listAdapter.delete = patchAdapterFunction(listName, 'delete', originalDelete, listAdapter, cacheAPI )

        // A Knex only stabs!
        listAdapter._createOrUpdateField = async (args) => {
            throw new Error(`Knex listAdapter._createOrUpdateField is called! This means, this cache works incorrectly! You should either disable caching for list ${listName} or check your code. You should not have editable many:true fields in your code!`)
        }

        listAdapter._setNullByValue = async (args) => {
            throw new Error(`Knex listAdapter._setNullByValue is called! This means, this cache works incorrectly! You should either disable caching for list ${listName} or check your code.`)
        }
    }

    logger.info({
        enabledLists,
        disabledLists,
    })
}

/**
 * Patches a keystone mutation to add cache functionality
 * @param {string} listName
 * @param {string} functionName
 * @param {function} f
 * @param {Object} listAdapter
 * @param {AdapterCache} cache
 * @returns {function(...[*]): Promise<*>}
 */
function patchAdapterFunction ( listName, functionName, f, listAdapter, cache ) {
    return async ( ...args ) => {

        // Get mutation value
        const functionResult = await f.apply(listAdapter, args)

        // Drop global state and local cache
        await cache.setState(listName, functionResult[UPDATED_AT_FIELD])
        cache.dropCacheByList(listName)

        cache.logEvent({
            type: 'DROP',
            functionName,
            listName,
            key: listName,
            result: functionResult,
        })

        return functionResult
    }
}

/**
 * Patch adapter query function, adding cache functionality
 * @param {string} listName
 * @param {string} functionName
 * @param {function} f
 * @param {Object} listAdapter
 * @param {AdapterCache} cacheAPI
 * @param {function} getKey get key function. Called with arguments of f
 * @param {function} getQuery get query from args. Called with arguments of f
 * @param {Object} relations
 * @returns {(function(...[*]): Promise<*|*[]>)|*}
 */
function patchAdapterQueryFunction (listName, functionName, f, listAdapter, cacheAPI, getKey, getQuery = () => null, relations = {}) {
    return async ( ...args ) => {
        cacheAPI.incrementTotal()

        let key = getKey(args)
        if (key) {
            key = `${listName}_${functionName}_${key}`
        }

        let response = []
        const cachedItem = key ? cacheAPI.getCache(key) : null
        const listLastUpdate = await cacheAPI.getState(listName)

        if (cachedItem) {
            const cacheLastUpdate = cachedItem.lastUpdate
            if (cacheLastUpdate && cacheLastUpdate.getTime() === listLastUpdate.getTime()) {
                cacheAPI.incrementHit()

                cacheAPI.logEvent({
                    type: 'HIT',
                    functionName,
                    listName,
                    key,
                    result: cachedItem,
                })

                // TODO
                // DELETE THIS!
                const cachedResponse = cloneDeep(cachedItem.response)
                const realResponse = await f.apply(listAdapter, args)
                const diff = !isEqual(realResponse, cachedResponse)
                if (diff) {
                    cacheAPI.logEvent({
                        type: 'ALERT-EQUAL',
                        functionName,
                        key,
                        listName,
                        result: { cached: JSON.stringify(cachedResponse), real: JSON.stringify(realResponse), diff: diff },
                    })
                }


                return cloneDeep(cachedItem.response)
            }
        }

        response = await f.apply(listAdapter, args)
        const copiedResponse = cloneDeep(response)

        // Note: do not cache complex requests. Check queryIsComplex docstring for details
        // Todo (@toplenboren) (DOMA-2681) Sometimes listName !== fieldName. Think about these cases!
        const shouldCache = !queryIsComplex(getQuery(args), listName, relations)
        if (shouldCache) {
            cacheAPI.setCache(listName, key, {
                lastUpdate: listLastUpdate,
                response: copiedResponse,
            })
        }
        
        cacheAPI.logEvent({
            type: 'MISS',
            functionName,
            key,
            listName,
            result: { copiedResponse, cached: shouldCache },
        })

        return response
    }
}

/**
 * Query is complex if it searches on a relation. Example: allBooks(where: {author: { id: ...}})
 * @param {object} query - A Keystone GraphQL search query. Like { id: "1" }
 * @param {string} list - a name of the list
 * @param {object} relations - an object describing all relations in the project
 * @returns {boolean}
 */
function queryIsComplex (query, list, relations) {
    if (!query) { return false }
    const relsForList = get(relations, list, [])
    for (const rel of relsForList) {
        if (queryHasField(query, rel. toLowerCase()))
            return true
    }
    return false
}

module.exports = {
    AdapterCache,
}