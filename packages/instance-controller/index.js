// @flow

const getDB = require("database").default
const runInstance = require("./run-instance.js")

// TODO intelligently run instances e.g. examining runtime
// TODO use memory intelligently, don't load all instance data into RAM

async function loop(params) {
  const { db } = params

  // Get all incomplete instances
  const incompleteInstances = await db("instance").where(
    db.raw("COALESCE(instance_state->>'complete', 'false')"),
    "!=",
    true
  )

  await Promise.all(
    incompleteInstances.map(instance => runInstance(params, instance))
  )

  setTimeout(() => {
    loop(params)
  }, 100)
}

async function main() {
  const db = await getDB()
  loop({ db })
}

main()
