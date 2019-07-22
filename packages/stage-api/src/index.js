// @flow

const { send, json } = require("micro")
const got = require("got")
const getDB = require("database")
const { struct } = require("superstruct")
const safeEval = require("safe-eval")

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
        try {
          typeMap[type.def.name] = struct(
            safeEval(type.def.superstruct, { struct })
          )
        } catch (e) {
          console.log(`Failure to parse type "${type.def.name}"`)
        }
      }
    }
  }
  return typeMap
}

async function replaceEnvVars(db, str) {
  if (str.trim().startsWith("$")) {
    try {
      return (await db("env_var")
        .where("name", str.trim().slice(1))
        .first()).value
    } catch (e) {
      throw new Error(`Env var "${str.trim().slice(1)}" not found`)
    }
  } else {
    return str
  }
}

module.exports = async (req, res) => {
  const db = await getCachedDB()
  const reqBody = await json(req)
  const typeMap = await getTypes(db)
  const stageName = req.url.slice(1)

  if (!reqBody.instance_id) reqBody.instance_id = "standalone-stage-api"

  const stageDef = await db("stage_def")
    .where(db.raw("lower(name)"), stageName.toLowerCase())
    .first()

  if (!stageDef)
    return send(res, 404, `Stage "${stageName}" not found (not case-sensitive)`)

  for (const [inputKey, inputDef] of Object.entries(stageDef.def.inputs)) {
    const inputVal = reqBody.inputs[inputKey]
      ? reqBody.inputs[inputKey].value
      : undefined
    if (inputVal === undefined && inputDef.optional) continue
    try {
      if (typeMap[inputDef.type]) {
        typeMap[inputDef.type](inputVal)
      } else {
        struct(inputDef.type)(inputVal)
      }
    } catch (e) {
      return send(
        res,
        400,
        `Stage API: Input "${inputKey}" didn't match the correct type "${
          inputDef.type
        }"\n\n${e.toString()}\n\n`
      )
    }
  }

  let stageRes
  try {
    if (!stageDef.def.endpoint) throw new Error("endpoint not specified")

    stageRes = await got(await replaceEnvVars(db, stageDef.def.endpoint), {
      method: "POST",
      json: true,
      headers: { "content-type": "application/json" },
      body: reqBody
    })
  } catch (e) {
    return send(
      res,
      500,
      `Stage API: Couldn't call out to stage: ${e.toString()}, ${JSON.stringify(
        e.response && e.response.body
      )}`
    )
  }

  if (!stageRes) {
    return send(
      res,
      500,
      `Stage API: Couldn't call out to stage, stage function didn't respond.`
    )
  }

  // Check output types
  if (stageRes.body.outputs) {
    for (const [outputKey, outputDef] of Object.entries(
      stageDef.def.outputs || {}
    )) {
      if (!stageRes.body.outputs[outputKey]) continue
      try {
        if (typeMap[outputDef.type]) {
          typeMap[outputDef.type](stageRes.body.outputs[outputKey].value)
        } else {
          struct(outputDef.type)(stageRes.body.outputs[outputKey].value)
        }
      } catch (e) {
        return send(
          res,
          500,
          `Stage API: Output "${outputKey}" didn't match the correct type "${
            outputDef.type
          }"\n\n${e.toString()}\n\n${outputKey}: ${JSON.stringify(
            stageRes.body.outputs[outputKey]
              ? stageRes.body.outputs[outputKey].value
              : undefined
          )}`
        )
      }
    }
  }

  return send(res, 200, stageRes.body)
}
