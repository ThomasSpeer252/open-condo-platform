// auto generated by kmigrator
// KMIGRATOR:0150_alter_meterreadingsource_type:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMC4yIG9uIDIwMjItMDctMjAgMDY6MDUKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAxNDlfdGlja2V0X2NvbXBsZXRlZGF0X3RpY2tldGNoYW5nZV9jb21wbGV0ZWRhdGZyb21fYW5kX21vcmUnKSwKICAgIF0KCiAgICBvcGVyYXRpb25zID0gWwogICAgICAgIG1pZ3JhdGlvbnMuQWx0ZXJGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nbWV0ZXJyZWFkaW5nc291cmNlJywKICAgICAgICAgICAgbmFtZT0ndHlwZScsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5DaGFyRmllbGQoY2hvaWNlcz1bKCdpbXBvcnRfY29uZG8nLCAnaW1wb3J0X2NvbmRvJyksICgnY2FsbCcsICdjYWxsJyksICgnbW9iaWxlX2FwcCcsICdtb2JpbGVfYXBwJyksICgnZXh0ZXJuYWxfaW1wb3J0JywgJ2V4dGVybmFsX2ltcG9ydCcpXSwgbWF4X2xlbmd0aD01MCksCiAgICAgICAgKSwKICAgIF0K

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Alter field type on meterreadingsource
--
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Alter field type on meterreadingsource
--
COMMIT;

    `)
}
