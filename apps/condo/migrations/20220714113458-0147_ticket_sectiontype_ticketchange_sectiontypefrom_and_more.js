// auto generated by kmigrator
// KMIGRATOR:0147_ticket_sectiontype_ticketchange_sectiontypefrom_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMCBvbiAyMDIyLTA3LTE0IDA2OjM0Cgpmcm9tIGRqYW5nby5kYiBpbXBvcnQgbWlncmF0aW9ucywgbW9kZWxzCgoKY2xhc3MgTWlncmF0aW9uKG1pZ3JhdGlvbnMuTWlncmF0aW9uKToKCiAgICBkZXBlbmRlbmNpZXMgPSBbCiAgICAgICAgKCdfZGphbmdvX3NjaGVtYScsICcwMTQ2X2IyYmFwcF9pc2dsb2JhbF9iMmJhcHBoaXN0b3J5cmVjb3JkX2lzZ2xvYmFsJyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSd0aWNrZXQnLAogICAgICAgICAgICBuYW1lPSdzZWN0aW9uVHlwZScsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5UZXh0RmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J3RpY2tldGNoYW5nZScsCiAgICAgICAgICAgIG5hbWU9J3NlY3Rpb25UeXBlRnJvbScsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5UZXh0RmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J3RpY2tldGNoYW5nZScsCiAgICAgICAgICAgIG5hbWU9J3NlY3Rpb25UeXBlVG8nLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuVGV4dEZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSd0aWNrZXRoaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgbmFtZT0nc2VjdGlvblR5cGUnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuVGV4dEZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgIF0K

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field sectionType to ticket
--
ALTER TABLE "Ticket" ADD COLUMN "sectionType" text NULL;
--
-- Add field sectionTypeFrom to ticketchange
--
ALTER TABLE "TicketChange" ADD COLUMN "sectionTypeFrom" text NULL;
--
-- Add field sectionTypeTo to ticketchange
--
ALTER TABLE "TicketChange" ADD COLUMN "sectionTypeTo" text NULL;
--
-- Add field sectionType to tickethistoryrecord
--
ALTER TABLE "TicketHistoryRecord" ADD COLUMN "sectionType" text NULL;


UPDATE "Ticket"
SET "sectionType" = 'section'
WHERE "unitType" != 'parking' AND "unitType" IS NOT NULL;

UPDATE "Ticket"
SET "sectionType" = 'parking'
WHERE "unitType" = 'parking';

COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field sectionType to tickethistoryrecord
--
ALTER TABLE "TicketHistoryRecord" DROP COLUMN "sectionType" CASCADE;
--
-- Add field sectionTypeTo to ticketchange
--
ALTER TABLE "TicketChange" DROP COLUMN "sectionTypeTo" CASCADE;
--
-- Add field sectionTypeFrom to ticketchange
--
ALTER TABLE "TicketChange" DROP COLUMN "sectionTypeFrom" CASCADE;
--
-- Add field sectionType to ticket
--
ALTER TABLE "Ticket" DROP COLUMN "sectionType" CASCADE;
COMMIT;

    `)
}
