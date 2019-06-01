// @flow

const { json, send } = require("micro")
const getDB = require("database").default
const { struct } = require("superstruct")
const visualize = require("micro-visualize")
const safeEval = require("safe-eval")

let db
async function getCachedDB() {
  if (db) return db
  return (db = await getDB())
}

module.exports = visualize(async (req, res) => {
  if (req.method !== "POST") throw new Error("must be POST request")
  const db = await getCachedDB()
  const { typeName, object } = await json(req)
  if (!typeName) throw new Error("typeName is required")
  if (!object) throw new Error("object is required")
  if (typeof object === "string") throw new Error("object is string")

  const dbType = await db("type_def")
    .select("def")
    .where({ name: typeName })
    .first()
  if (!dbType) throw new Error("Type not found")

  let dbTypeCheckFunc
  try {
    dbTypeCheckFunc = struct(safeEval(dbType.def.superstruct))
  } catch (e) {
    const error = `Issue parsing the superstruct type, check your type definition:\n\nDefinition:\n:${
      dbType.def.superstruct
    }\n\nError:\n${e.toString()}`
    // TODO send error to db
    return send(res, 400, { error })
  }

  try {
    dbTypeCheckFunc(object)
  } catch (e) {
    return send(res, 400, { error: e.toString() })
  }

  return { valid: true }
})
