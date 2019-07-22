// @flow

const getDB = require("../")
const { definitions, envVars } = require("./examples")

module.exports = async db => {
  if (!db) db = await getDB()
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
  await db.destroy()
  console.log("done")
  process.exit(0)
}
