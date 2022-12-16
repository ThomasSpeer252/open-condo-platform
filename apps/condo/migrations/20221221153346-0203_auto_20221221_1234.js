// auto generated by kmigrator
// KMIGRATOR:0203_auto_20221221_1234:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDMuMi45IG9uIDIwMjItMTItMjEgMTI6MzQKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKaW1wb3J0IGRqYW5nby5kYi5tb2RlbHMuZGVsZXRpb24KCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAyMDJfdGlja2V0ZXhwb3J0dGFza19vcHRpb25zX2FuZF9tb3JlJyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdiYW5rYWNjb3VudCcsCiAgICAgICAgICAgIG5hbWU9J3Byb3BlcnR5JywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkZvcmVpZ25LZXkoZGJfY29sdW1uPSdwcm9wZXJ0eScsIGRlZmF1bHQ9JzkyRUMzRjUzLUVDMEMtNDdBOC1CMzJBLUE1N0U5NDlDRjU3NCcsIG9uX2RlbGV0ZT1kamFuZ28uZGIubW9kZWxzLmRlbGV0aW9uLkNBU0NBREUsIHJlbGF0ZWRfbmFtZT0nKycsIHRvPSdfZGphbmdvX3NjaGVtYS5wcm9wZXJ0eScpLAogICAgICAgICAgICBwcmVzZXJ2ZV9kZWZhdWx0PUZhbHNlLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nYmFua2FjY291bnRoaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgbmFtZT0ncHJvcGVydHknLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuVVVJREZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgIF0K

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field property to bankaccount
--

-- NOTE(antonal): NOT NULL constraint cannot be set right when adding new column "property" to "BankAccount",
-- because there is no way to initialize it with default value that points to actual records from "Property".
-- An error "cannot use subquery in DEFAULT expression" will be thrown in case of using SQL-queries for "DEFAULT" part.
-- We don't have any records yet in BankAccount table.
-- So, just to make this migration to succeed, we do following:
-- 1. Add table without NOT NULL constraint
-- 2. Set it to "id" column value of first Property
-- 3. Set default constraint 

ALTER TABLE "BankAccount" ADD COLUMN "property" uuid CONSTRAINT "BankAccount_property_55274c76_fk_Property_id" REFERENCES "Property"("id") DEFERRABLE INITIALLY DEFERRED; SET CONSTRAINTS "BankAccount_property_55274c76_fk_Property_id" IMMEDIATE;
UPDATE "BankAccount" SET property = (SELECT id FROM "Property" ORDER BY "createdAt" ASC LIMIT 1);
ALTER TABLE "BankAccount" ALTER COLUMN "property" SET NOT NULL;
ALTER TABLE "BankAccount" ALTER COLUMN "property" DROP DEFAULT;
--
-- Add field property to bankaccounthistoryrecord
--
ALTER TABLE "BankAccountHistoryRecord" ADD COLUMN "property" uuid NULL;
CREATE INDEX "BankAccount_property_55274c76" ON "BankAccount" ("property");
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field property to bankaccounthistoryrecord
--
ALTER TABLE "BankAccountHistoryRecord" DROP COLUMN "property" CASCADE;
--
-- Add field property to bankaccount
--
ALTER TABLE "BankAccount" DROP COLUMN "property" CASCADE;
COMMIT;

    `)
}
