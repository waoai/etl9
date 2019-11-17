const runInstance = require("./run-instance.js")

// TODO intelligently run instances e.g. examining runtime
// TODO use memory intelligently, don't load all instance data into RAM

let iterations = 0

async function loop(params) {
  const { db, repeat = false } = params

  console.log(`Loop [${iterations++}] Starting...`)
  const startTime = Date.now()

  // Get all incomplete instances
  const incompleteInstances = await db("instance")
    .where(
      db.raw("COALESCE(instance_state->>'complete', 'false')"),
      "!=",
      "true"
    )
    .where(db.raw("COALESCE(instance_state->>'paused', 'false')"), "!=", "true")

  console.log(
    `Loop [${iterations++}] Loaded ${incompleteInstances.length} Instances`
  )

  await Promise.all(
    incompleteInstances.map(instance => runInstance(params, instance))
  )

  console.log(
    `Loop [${iterations}] completed in ${(
      (Date.now() - startTime) /
      1000
    ).toFixed(2)}s`
  )

  if (repeat) {
    setTimeout(() => {
      loop(params)
    }, 500)
  }
}

module.exports = loop
