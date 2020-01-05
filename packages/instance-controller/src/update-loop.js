const cleanupDatabase = require("./cleanup-database.js")
const runInstance = require("./run-instance.js")
const moment = require("moment")

// TODO intelligently run instances e.g. examining runtime
// TODO use memory intelligently, don't load all instance data into RAM

let iterations = 0

async function loop(params) {
  const { db, repeat = false } = params

  console.log(`Loop [${++iterations}] Starting...`)
  const startTime = moment()

  // Get all incomplete instances
  const incompleteInstances = await db("instance")
    .where(
      db.raw("COALESCE(instance_state->>'complete', 'false')"),
      "!=",
      "true"
    )
    .where(db.raw("COALESCE(instance_state->>'paused', 'false')"), "!=", "true")

  console.log(
    `Loop [${iterations}] Loaded ${incompleteInstances.length} Instances`
  )

  await Promise.all(
    incompleteInstances.map(instance => runInstance(params, instance))
  )

  if (iterations % 1000 === 0) await cleanupDatabase(db)

  console.log(
    `Loop [${iterations}] completed in ${(
      (moment().valueOf() - startTime.valueOf()) /
      1000
    ).toFixed(2)}s`
  )
  await db("system_loop_profile").insert({
    instance_count: incompleteInstances.length,
    started_at: startTime,
    ended_at: moment()
  })

  if (repeat) {
    setTimeout(() => {
      loop(params)
    }, 5000)
  }
}

module.exports = loop
