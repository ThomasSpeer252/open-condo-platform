// auto generated by kmigrator
// KMIGRATOR:0178_remove_organizationemployeerole_canmanagedivisions_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMSBvbiAyMDIyLTEwLTE5IDEzOjExCgpmcm9tIGRqYW5nby5kYiBpbXBvcnQgbWlncmF0aW9ucwoKCmNsYXNzIE1pZ3JhdGlvbihtaWdyYXRpb25zLk1pZ3JhdGlvbik6CgogICAgZGVwZW5kZW5jaWVzID0gWwogICAgICAgICgnX2RqYW5nb19zY2hlbWEnLCAnMDE3N19hc3NpZ25lZXNjb3BlX2Fzc2lnbmVlc2NvcGVoaXN0b3J5cmVjb3JkX2FuZF9tb3JlJyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLlJlbW92ZUZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdvcmdhbml6YXRpb25lbXBsb3llZXJvbGUnLAogICAgICAgICAgICBuYW1lPSdjYW5NYW5hZ2VEaXZpc2lvbnMnLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5SZW1vdmVGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nb3JnYW5pemF0aW9uZW1wbG95ZWVyb2xlJywKICAgICAgICAgICAgbmFtZT0nY2FuUmVhZEVudGl0aWVzT25seUluU2NvcGVPZkRpdmlzaW9uJywKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuUmVtb3ZlRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J29yZ2FuaXphdGlvbmVtcGxveWVlcm9sZWhpc3RvcnlyZWNvcmQnLAogICAgICAgICAgICBuYW1lPSdjYW5NYW5hZ2VEaXZpc2lvbnMnLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5SZW1vdmVGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nb3JnYW5pemF0aW9uZW1wbG95ZWVyb2xlaGlzdG9yeXJlY29yZCcsCiAgICAgICAgICAgIG5hbWU9J2NhblJlYWRFbnRpdGllc09ubHlJblNjb3BlT2ZEaXZpc2lvbicsCiAgICAgICAgKSwKICAgIF0K

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Remove field canManageDivisions from organizationemployeerole
--
ALTER TABLE "OrganizationEmployeeRole" DROP COLUMN "canManageDivisions" CASCADE;
--
-- Remove field canReadEntitiesOnlyInScopeOfDivision from organizationemployeerole
--
ALTER TABLE "OrganizationEmployeeRole" DROP COLUMN "canReadEntitiesOnlyInScopeOfDivision" CASCADE;
--
-- Remove field canManageDivisions from organizationemployeerolehistoryrecord
--
ALTER TABLE "OrganizationEmployeeRoleHistoryRecord" DROP COLUMN "canManageDivisions" CASCADE;
--
-- Remove field canReadEntitiesOnlyInScopeOfDivision from organizationemployeerolehistoryrecord
--
ALTER TABLE "OrganizationEmployeeRoleHistoryRecord" DROP COLUMN "canReadEntitiesOnlyInScopeOfDivision" CASCADE;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Remove field canReadEntitiesOnlyInScopeOfDivision from organizationemployeerolehistoryrecord
--
ALTER TABLE "OrganizationEmployeeRoleHistoryRecord" ADD COLUMN "canReadEntitiesOnlyInScopeOfDivision" boolean NULL;
--
-- Remove field canManageDivisions from organizationemployeerolehistoryrecord
--
ALTER TABLE "OrganizationEmployeeRoleHistoryRecord" ADD COLUMN "canManageDivisions" boolean NULL;
--
-- Remove field canReadEntitiesOnlyInScopeOfDivision from organizationemployeerole
--
ALTER TABLE "OrganizationEmployeeRole" ADD COLUMN "canReadEntitiesOnlyInScopeOfDivision" boolean NOT NULL;
--
-- Remove field canManageDivisions from organizationemployeerole
--
ALTER TABLE "OrganizationEmployeeRole" ADD COLUMN "canManageDivisions" boolean NOT NULL;
COMMIT;

    `)
}
