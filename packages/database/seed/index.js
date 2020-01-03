// @flow

const getDB = require("../")
const { definitions, envVars } = require("./examples")

module.exports = async db => {
  let destroyWhenComplete = false
  if (!db) {
    destroyWhenComplete = true
    db = await getDB()
  }
  const defCount = parseInt((await db("definition").count())[0].count)
  console.log(`${defCount} definitions found`)
  if (defCount !== 0)
    throw new Error("Database definitions already found- not seeding")
  console.log("creating seed definitions...")
  for (const def of definitions) {
    await db("definition").insert({ def })
  }
  console.log("creating seed environment variables...")
  for (const envVar of envVars) {
    await db("env_var").insert({
      name: envVar.name,
      value: JSON.stringify(envVar.value),
      encrypted: envVar.encrypted
    })
  }
  console.log("disconnecting from database...")
  if (destroyWhenComplete) {
    console.log("destroying database connection")
    await db.destroy()
    // process.exit(0)
  }
  console.log("done seeding")
}
