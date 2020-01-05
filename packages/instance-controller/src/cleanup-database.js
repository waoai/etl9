module.exports = async db => {
  await db.raw("VACUUM FULL")

  // TODO remove old system_loop_profile
  // TODO remove old system_instance_profile
  // TODO remove old system_stage_profile
}
