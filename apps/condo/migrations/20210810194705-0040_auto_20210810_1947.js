// auto generated by kmigrator
// KMIGRATOR:0040_auto_20210810_1947:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDMuMi41IG9uIDIwMjEtMDgtMTAgMTQ6NDcNCg0KZnJvbSBkamFuZ28uZGIgaW1wb3J0IG1pZ3JhdGlvbnMsIG1vZGVscw0KDQoNCmNsYXNzIE1pZ3JhdGlvbihtaWdyYXRpb25zLk1pZ3JhdGlvbik6DQoNCiAgICBkZXBlbmRlbmNpZXMgPSBbDQogICAgICAgICgnX2RqYW5nb19zY2hlbWEnLCAnMDAzOV9hdXRvXzIwMjEwODEwXzA5MTgnKSwNCiAgICBdDQoNCiAgICBvcGVyYXRpb25zID0gWw0KICAgICAgICBtaWdyYXRpb25zLkFsdGVyRmllbGQoDQogICAgICAgICAgICBtb2RlbF9uYW1lPSdvcmdhbml6YXRpb25lbXBsb3llZScsDQogICAgICAgICAgICBuYW1lPSdpZCcsDQogICAgICAgICAgICBmaWVsZD1tb2RlbHMuVVVJREZpZWxkKHByaW1hcnlfa2V5PVRydWUsIHNlcmlhbGl6ZT1GYWxzZSksDQogICAgICAgICksDQogICAgICAgIG1pZ3JhdGlvbnMuQWx0ZXJGaWVsZCgNCiAgICAgICAgICAgIG1vZGVsX25hbWU9J29yZ2FuaXphdGlvbmVtcGxveWVlJywNCiAgICAgICAgICAgIG5hbWU9J25ld0lkJywNCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5VVUlERmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSwNCiAgICAgICAgKSwNCiAgICAgICAgbWlncmF0aW9ucy5BbHRlckZpZWxkKA0KICAgICAgICAgICAgbW9kZWxfbmFtZT0nb3JnYW5pemF0aW9uZW1wbG95ZWVoaXN0b3J5cmVjb3JkJywNCiAgICAgICAgICAgIG5hbWU9J2hpc3RvcnlfaWQnLA0KICAgICAgICAgICAgZmllbGQ9bW9kZWxzLlVVSURGaWVsZChkYl9pbmRleD1UcnVlKSwNCiAgICAgICAgKSwNCiAgICBdDQo=

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
    CREATE EXTENSION if not exists "uuid-ossp";

    --
    -- Alter field id on organizationemployee
    --
    ALTER TABLE "OrganizationEmployee" RENAME COLUMN id TO "oldId";
    ALTER TABLE "OrganizationEmployee" ADD COLUMN id UUID NULL;
    UPDATE "OrganizationEmployee" SET id = uuid_generate_v4();
    
    ALTER TABLE "OrganizationEmployeeHistoryRecord" RENAME COLUMN history_id TO old_history_id;
    ALTER TABLE "OrganizationEmployeeHistoryRecord" ADD COLUMN history_id UUID NULL;
    
    UPDATE "OrganizationEmployeeHistoryRecord" hr
    SET history_id = e.id
    FROM "OrganizationEmployee" as e
    WHERE(
      e."oldId" = hr.old_history_id
    );
    ALTER TABLE "OrganizationEmployeeHistoryRecord" ALTER COLUMN history_id SET NOT NULL;

    --
    -- Alter field newId on organizationemployee
    --
    ALTER TABLE "OrganizationEmployee" ADD COLUMN "new_newId" UUID NULL;
    ALTER TABLE "OrganizationEmployee" DROP COLUMN "newId";
    ALTER TABLE "OrganizationEmployee" RENAME COLUMN "new_newId" TO "newId";

    COMMIT;
    END;
    `)
}

exports.down = async (knex) => {
    return
}
