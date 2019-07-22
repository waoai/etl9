const runInstance = require("./run-instance.js")

// TODO intelligently run instances e.g. examining runtime
// TODO use memory intelligently, don't load all instance data into RAM

async function loop(params) {
  const { db, repeat = false } = params

  // Get all incomplete instances
  const incompleteInstances = await db("instance")
    .where(db.raw("COALESCE(instance_state->>'complete', 'false')"), "!=", true)
    .where(db.raw("COALESCE(instance_state->>'paused', 'false')"), "!=", true)

  await Promise.all(
    incompleteInstances.map(instance => runInstance(params, instance))
  )

  if (repeat) {
    setTimeout(() => {
      loop(params)
    }, 100)
  }
}

module.exports = loop
