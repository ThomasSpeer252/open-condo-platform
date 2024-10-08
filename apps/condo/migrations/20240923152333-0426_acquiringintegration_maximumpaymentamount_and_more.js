// auto generated by kmigrator
// KMIGRATOR:0426_acquiringintegration_maximumpaymentamount_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMi4xNSBvbiAyMDI0LTA5LTIzIDEwOjIzCgpmcm9tIGRqYW5nby5kYiBpbXBvcnQgbWlncmF0aW9ucywgbW9kZWxzCgoKY2xhc3MgTWlncmF0aW9uKG1pZ3JhdGlvbnMuTWlncmF0aW9uKToKCiAgICBkZXBlbmRlbmNpZXMgPSBbCiAgICAgICAgKCdfZGphbmdvX3NjaGVtYScsICcwNDI1X21lc3NhZ2VfbWVzc2FnZV91c2VyX3N0YXR1c19zZW50YXQnKSwKICAgIF0KCiAgICBvcGVyYXRpb25zID0gWwogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J2FjcXVpcmluZ2ludGVncmF0aW9uJywKICAgICAgICAgICAgbmFtZT0nbWF4aW11bVBheW1lbnRBbW91bnQnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuRGVjaW1hbEZpZWxkKGJsYW5rPVRydWUsIGRlY2ltYWxfcGxhY2VzPTgsIG1heF9kaWdpdHM9MTgsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdhY3F1aXJpbmdpbnRlZ3JhdGlvbmhpc3RvcnlyZWNvcmQnLAogICAgICAgICAgICBuYW1lPSdtYXhpbXVtUGF5bWVudEFtb3VudCcsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5EZWNpbWFsRmllbGQoYmxhbms9VHJ1ZSwgZGVjaW1hbF9wbGFjZXM9NCwgbWF4X2RpZ2l0cz0xOCwgbnVsbD1UcnVlKSwKICAgICAgICApLAogICAgXQo=

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- [CUSTOM] Set Statement Timeout to some large amount - 25 min (25 * 60 => 1500 sec)
--
SET statement_timeout = '1500s';
--
-- Add field maximumPaymentAmount to acquiringintegration
--
ALTER TABLE "AcquiringIntegration" ADD COLUMN "maximumPaymentAmount" numeric(18, 8) NULL;
--
-- Add field maximumPaymentAmount to acquiringintegrationhistoryrecord
--
ALTER TABLE "AcquiringIntegrationHistoryRecord" ADD COLUMN "maximumPaymentAmount" numeric(18, 4) NULL;
--
-- [CUSTOM] Revert Statement Timeout to default amount - 10 secs
--
SET statement_timeout = '10s';
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field maximumPaymentAmount to acquiringintegrationhistoryrecord
--
ALTER TABLE "AcquiringIntegrationHistoryRecord" DROP COLUMN "maximumPaymentAmount" CASCADE;
--
-- Add field maximumPaymentAmount to acquiringintegration
--
ALTER TABLE "AcquiringIntegration" DROP COLUMN "maximumPaymentAmount" CASCADE;
COMMIT;

    `)
}
