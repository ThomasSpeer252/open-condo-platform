/**
 * Generated by `createschema miniapp.B2BAppPromoBlock 'title:Text; subtitle:Text; backgroundColor:Text; backgroundImage:File'`
 */

const { Text, File, Url, Select, Integer, Checkbox } = require('@keystonejs/fields')

const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')

const { HEX_CODE_REGEXP, LINEAR_GRADIENT_REGEXP } = require('@condo/domains/common/constants/regexps')
const FileAdapter = require('@condo/domains/common/utils/fileAdapter')
const { getFileMetaAfterChange } = require('@condo/domains/common/utils/fileAdapter')
const access = require('@condo/domains/miniapp/access/B2BAppPromoBlock')
const { PROMO_BLOCK_TEXT_VARIANTS, PROMO_BLOCK_DARK_TEXT_VARIANT } = require('@condo/domains/miniapp/constants')
const PROMO_BLOCK_FOLDER_NAME = 'B2BAppPromoBlocks'
const Adapter = new FileAdapter(PROMO_BLOCK_FOLDER_NAME)
const fileMetaAfterChange = getFileMetaAfterChange(Adapter, 'backgroundImage')



const B2BAppPromoBlock = new GQLListSchema('B2BAppPromoBlock', {
    schemaDoc: 'Promotion banner which appears in "Miniapps" section of CRM. Used to promote B2BApps, discounts, collaborations and so on',
    fields: {
        title: {
            schemaDoc: 'Title of promotion banner. Main catch phrase is placed here. Must contain no more than 27 characters per line (including spaces) and no more than 2 lines in total.',
            type: Text,
            isRequired: true,
        },
        subtitle: {
            schemaDoc: 'Secondary text of promotion banner. Some additional info goes here. Must contain no more than 40 characters per line (including spaces) and no more than 2 lines in total.',
            type: Text,
            isRequired: true,
        },
        textVariant: {
            schemaDoc: `Variant of texts inside block. Can be one of the following: [${PROMO_BLOCK_TEXT_VARIANTS.join(', ')}]`,
            type: Select,
            options: PROMO_BLOCK_TEXT_VARIANTS,
            defaultValue: PROMO_BLOCK_DARK_TEXT_VARIANT,
            isRequired: true,
        },
        backgroundColor: {
            schemaDoc: 'Background color of promo block. Can be hex code or linear gradient.',
            type: Text,
            isRequired: true,
            hooks: {
                validateInput: ({ resolvedData, fieldPath, addFieldValidationError }) => {
                    if (typeof resolvedData[fieldPath] === 'string' &&
                        !LINEAR_GRADIENT_REGEXP.test(resolvedData[fieldPath]) &&
                        !HEX_CODE_REGEXP.test(resolvedData[fieldPath])) {
                        return addFieldValidationError('Invalid color specified. Color must be valid hex or linear gradient!')
                    }
                },
            },
        },
        backgroundImage: {
            schemaDoc: 'PNG image which appears next to text on large devices',
            type: File,
            isRequired: true,
            adapter: Adapter,
        },
        targetUrl: {
            schemaDoc: 'Link to the resource that this B2BAppPromoBlock promotes',
            type: Url,
            isRequired: true,
        },
        external: {
            schemaDoc: 'Determines whether the banner leads to an external resource or not. ' +
                'If external, interaction with block will lead to new tab. Otherwise user will stay in current tab',
            isRequired: true,
            type: Checkbox,
            defaultValue: false,
        },
        priority: {
            schemaDoc: 'The number used to determine the position of the block among the others. ' +
                'Blocks with higher priority appear earlier. ' +
                'Blocks with the same priority are sorted from newest to oldest. The default value is 1.',
            type: Integer,
            isRequired: true,
            defaultValue: 1,
        },
    },
    hooks: {
        afterChange: fileMetaAfterChange,
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadB2BAppPromoBlocks,
        create: access.canManageB2BAppPromoBlocks,
        update: access.canManageB2BAppPromoBlocks,
        delete: false,
        auth: true,
    },
})

module.exports = {
    B2BAppPromoBlock,
}
