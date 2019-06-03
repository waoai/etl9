// @flow

const { send, json } = require("micro")
const got = require("got")
const getDB = require("database").default
const { struct } = require("superstruct")

let db
async function getCachedDB() {
  if (db) return db
  return (db = await getDB())
}

// TODO cache types
async function getTypes(db) {
  const allTypes = await db("type_def")
  const typeMap = {}
  for (const type of allTypes) {
    try {
      typeMap[type.def.name] = struct(JSON.parse(type.def.superstruct))
    } catch (e) {
      try {
        typeMap[type.def.name] = struct(type.def.superstruct)
      } catch (e) {
        console.log(`Failure to parse type "${type.def.name}"`)
      }
    }
  }
  return typeMap
}

module.exports = async (req, res) => {
  const db = await getCachedDB()
  const reqBody = await json(req)
  const typeMap = await getTypes(db)
  const stageName = req.url.slice(1)

  if (!reqBody.instance_id) reqBody.instance_id = "standalone-stage-api"

  const stageDef = await db("stage_def")
    .where(db.raw("lower(name)"), stageName)
    .first()

  if (!stageDef)
    return send(res, 404, `Stage "${stageName}" not found (not case-sensitive)`)

  for (const [inputKey, inputDef] of Object.entries(stageDef.def.inputs)) {
    try {
      if (typeMap[inputDef.type]) {
        typeMap[inputDef.type](reqBody.inputs[inputKey])
      } else {
        struct(inputDef.type)(reqBody.inputs[inputKey])
      }
    } catch (e) {
      return send(
        res,
        400,
        `Input "${inputKey}" didn't match the correct type "${
          inputDef.type
        }"\n\n${e.toString()}`
      )
    }
  }

  let stageRes
  try {
    stageRes = await got(stageDef.def.endpoint, {
      method: "POST",
      json: true,
      headers: { "content-type": "application/json" },
      body: reqBody
    })
  } catch (e) {
    return send(res, 500, `Couldn't call out to stage: ${e.response.body}`)
  }

  for (const [outputKey, outputDef] of Object.entries(
    stageDef.def.outputs || {}
  )) {
    try {
      if (typeMap[outputDef.type]) {
        typeMap[outputDef.type](stageRes.body.outputs[outputKey])
      } else {
        struct(outputDef.type)(stageRes.body.outputs[outputKey])
      }
    } catch (e) {
      return send(
        res,
        500,
        `Output "${outputKey}" didn't match the correct type "${
          outputDef.type
        }"\n\n${e.toString()}`
      )
    }
  }

  return send(res, 200, stageRes.body)
}
