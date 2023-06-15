// auto generated by kmigrator
// KMIGRATOR:0283_auto_20230615_0522:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDMuMi43IG9uIDIwMjMtMDYtMTUgMDU6MjIKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAyODFfcmVtb3ZlX25vdGlmaWNhdGlvbnVzZXJzZXR0aW5nX25vdGlmaWNhdGlvbnVzZXJzZXR0aW5nX3VuaXF1ZV91c2VyX21lc3NhZ2V0eXBlX21lc3NhZ2V0cmFuc3BvcnRfYW5kXycpLAogICAgXQoKICAgIG9wZXJhdGlvbnMgPSBbCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nYmlsbGluZ2ludGVncmF0aW9uJywKICAgICAgICAgICAgbmFtZT0nc2tpcE5vQWNjb3VudE5vdGlmaWNhdGlvbnMnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuQm9vbGVhbkZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdiaWxsaW5naW50ZWdyYXRpb25oaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgbmFtZT0nc2tpcE5vQWNjb3VudE5vdGlmaWNhdGlvbnMnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuQm9vbGVhbkZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgIF0K

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field skipNoAccountNotifications to billingintegration
--
ALTER TABLE "BillingIntegration" ADD COLUMN IF NOT EXISTS "skipNoAccountNotifications" boolean NULL DEFAULT FALSE;

UPDATE "BillingIntegration" SET "skipNoAccountNotifications" = TRUE WHERE "name" LIKE ('ЕПС');
--
-- Add field skipNoAccountNotifications to billingintegrationhistoryrecord
--
ALTER TABLE "BillingIntegrationHistoryRecord" ADD COLUMN IF NOT EXISTS "skipNoAccountNotifications" boolean NULL;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field skipNoAccountNotifications to billingintegrationhistoryrecord
--
ALTER TABLE "BillingIntegrationHistoryRecord" DROP COLUMN IF EXISTS "skipNoAccountNotifications" CASCADE;
--
-- Add field skipNoAccountNotifications to billingintegration
--
ALTER TABLE "BillingIntegration" DROP COLUMN IF EXISTS "skipNoAccountNotifications" CASCADE;
COMMIT;

    `)
}
