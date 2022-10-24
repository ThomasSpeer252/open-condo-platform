// auto generated by kmigrator
// KMIGRATOR:0180_organizationemployeerole_caninviteneworganizationemployees_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMSBvbiAyMDIyLTEwLTI0IDA5OjIxCgpmcm9tIGRqYW5nby5kYiBpbXBvcnQgbWlncmF0aW9ucywgbW9kZWxzCgoKY2xhc3MgTWlncmF0aW9uKG1pZ3JhdGlvbnMuTWlncmF0aW9uKToKCiAgICBkZXBlbmRlbmNpZXMgPSBbCiAgICAgICAgKCdfZGphbmdvX3NjaGVtYScsICcwMTc5X2NvbnRhY3RfaXN2ZXJpZmllZF9jb250YWN0aGlzdG9yeXJlY29yZF9pc3ZlcmlmaWVkJyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdvcmdhbml6YXRpb25lbXBsb3llZXJvbGUnLAogICAgICAgICAgICBuYW1lPSdjYW5JbnZpdGVOZXdPcmdhbml6YXRpb25FbXBsb3llZXMnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuQm9vbGVhbkZpZWxkKGRlZmF1bHQ9RmFsc2UpLAogICAgICAgICAgICBwcmVzZXJ2ZV9kZWZhdWx0PUZhbHNlLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nb3JnYW5pemF0aW9uZW1wbG95ZWVyb2xlaGlzdG9yeXJlY29yZCcsCiAgICAgICAgICAgIG5hbWU9J2Nhbkludml0ZU5ld09yZ2FuaXphdGlvbkVtcGxveWVlcycsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5Cb29sZWFuRmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSwKICAgICAgICApLAogICAgXQo=

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
-- Add field canInviteNewOrganizationEmployees to organizationemployeerole
--
ALTER TABLE "OrganizationEmployeeRole" ADD COLUMN "canInviteNewOrganizationEmployees" boolean DEFAULT false NOT NULL;
ALTER TABLE "OrganizationEmployeeRole" ALTER COLUMN "canInviteNewOrganizationEmployees" DROP DEFAULT;
--
-- Add field canInviteNewOrganizationEmployees to organizationemployeerolehistoryrecord
--
ALTER TABLE "OrganizationEmployeeRoleHistoryRecord" ADD COLUMN "canInviteNewOrganizationEmployees" boolean NULL;
--
-- [CUSTOM] Setting the field to the correct state for Admin and Foreman
--
UPDATE "OrganizationEmployeeRole"
SET "canInviteNewOrganizationEmployees" = true
WHERE "name" = 'employee.role.Foreman.name' OR "name" = 'employee.role.Administrator.name';
UPDATE "OrganizationEmployeeRole"
SET "canManageEmployees" = false
WHERE "name" = 'employee.role.Foreman.name';
UPDATE "OrganizationEmployeeRole"
SET "canManageEmployees" = true
WHERE "name" = 'employee.role.Manager.name';

COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field canInviteNewOrganizationEmployees to organizationemployeerolehistoryrecord
--
ALTER TABLE "OrganizationEmployeeRoleHistoryRecord" DROP COLUMN "canInviteNewOrganizationEmployees" CASCADE;
--
-- Add field canInviteNewOrganizationEmployees to organizationemployeerole
--
ALTER TABLE "OrganizationEmployeeRole" DROP COLUMN "canInviteNewOrganizationEmployees" CASCADE;
--
-- [CUSTOM] Setting the field to the correct state for Admin and Foreman
--
UPDATE "OrganizationEmployeeRole"
SET "canManageEmployees" = true
WHERE "name" = 'employee.role.Foreman.name';
UPDATE "OrganizationEmployeeRole"
SET "canManageEmployees" = false
WHERE "name" = 'employee.role.Manager.name';

COMMIT;

    `)
}
