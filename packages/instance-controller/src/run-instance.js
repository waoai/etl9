// @flow

const got = require("got")
const moment = require("moment")

let iter = 0
async function runInstance(
  { db, stageAPIURL = "http://localhost:9123/api/stage/", alwaysPoll = false },
  { instance_state, params, pipeline_def, id }
) {
  const runInstanceStartTime = moment()
  iter++

  // Pull environment variables
  const { envVarMap } = await db("env_var")
    .first()
    .select(db.raw(`jsonb_object_agg(name, value) as "envVarMap"`))

  // Initialize state if not initialized
  if (!instance_state || !instance_state.stageInstances) {
    instance_state = {}
    const stageInstances = {}
    for (const [stageId, stageInfo] of Object.entries(pipeline_def.nodes)) {
      // TODO make all the stage definition calls at once
      const stageDef = (await db("stage_def")
        .where({ name: stageInfo.name })
        .select("def")
        .first()).def
      stageInstances[stageId] = {
        stageName: stageInfo.name,
        def: stageDef,
        inputs: stageInfo.inputs,
        outputs: null,
        progress: 0,
        retries: 0,
        complete: false,
        error: null,
        state: null
      }
    }
    instance_state.stageInstances = stageInstances
  }

  // Iterate over each stage instance, if it can be run, hit the endpoint
  const { stageInstances } = instance_state
  for (const [stageId, stageInstance] of Object.entries(stageInstances)) {
    if (stageInstance.error && stageInstance.error.clearAtNextTick) {
      stageInstance.error = null
    }

    const { def, inputs, state, complete } = stageInstance
    if (complete) continue

    if (
      !alwaysPoll &&
      stageInstance.delay &&
      stageInstance.delay.waitUntil &&
      Date.now() < stageInstance.delay.waitUntil
    )
      continue

    // Can this stage be run?
    const inputsWithValues = {}
    for (const [inputKey, connectionDef] of Object.entries(inputs)) {
      if (connectionDef.node) {
        const pushingStageInstance = stageInstances[connectionDef.node]
        const pushingOutputDef =
          pushingStageInstance.def.outputs[connectionDef.output]
        const myInputDef = def.inputs[inputKey]

        if (!myInputDef) {
          stageInstance.error = {
            summary: `No input definition within "${def.name}" for "${inputKey}"`
          }
          break
        }

        if (
          connectionDef.waitForOutput === false &&
          !pushingStageInstance.outputs
        ) {
          continue
        }

        if (
          pushingStageInstance.outputs &&
          (pushingStageInstance.complete ||
            (pushingOutputDef.progressive && myInputDef.progressive))
        ) {
          inputsWithValues[inputKey] =
            pushingStageInstance.outputs[connectionDef.output]
        } else {
          stageInstance.error = {
            summary: `Waiting on "${connectionDef.node}".outputs["${connectionDef.output}"] -> "${stageId}".inputs["${inputKey}"]`,
            info: {
              outputDef: pushingOutputDef,
              inputDef: myInputDef,
              connectionDef
            },
            clearAtNextTick: true
          }
          break
        }
      } else if (connectionDef.param) {
        const value = params[connectionDef.param]
        if (typeof value === "string" && value.startsWith("$")) {
          inputsWithValues[inputKey] = {
            value: envVarMap[value.slice(1)]
          }
        } else {
          inputsWithValues[inputKey] = { value }
        }
      } else if (connectionDef.value) {
        inputsWithValues[inputKey] = { value: connectionDef.value }
      }
    }

    // Clear error or skip this stage instance
    if (stageInstance.error) {
      if (!stageInstance.retries) stageInstance.retries = 0
      // TODO configurable retry time
      if (
        stageInstance.error.time &&
        Date.now() > 1000 * stageInstance.retries + stageInstance.error.time
      ) {
        stageInstance.retries += 1
        stageInstance.error = null
      }
      continue
    }

    // Hit the endpoint...
    const requestBody = {
      state: stageInstance.state,
      inputs: inputsWithValues,
      stage_id: stageId,
      instance_id: id
    }
    let res
    const endpoint = `${stageAPIURL}${stageInstance.def.name}`
    try {
      stageInstance.callCount = (stageInstance.callCount || 0) + 1
      res = await got(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        json: true,
        body: requestBody
      })
    } catch (e) {
      const info = {
        statusCode: e.response && e.response.statusCode,
        message: e.response && e.response.body,
        requestBody,
        stageId,
        endpoint,
        instance_id: id,
        time: Date.now()
      }
      const summary = `Error in stage id "${stageId}" calling stage function "${
        stageInstance.def.name
      }". Code ${info.statusCode}. Response body "${
        info.message
      }". ${stageInstance.retries || 0} retries`
      console.log(iter.toString().padStart(5, "0"), summary)
      await db("log_entry").insert({
        tags: [stageInstance.def.name, id, stageId, "StagePausedOnError"],
        summary,
        info,
        level: "error"
      })
      stageInstance.error = { summary, ...info }
      if (stageInstance.retries >= 5) {
        instance_state.paused = true
        stageInstance.retries = 0
      }
      continue
    }

    const requestError = async s => {
      const info = {
        statusCode: res.statusCode,
        endpoint,
        message: res.body,
        requestBody,
        stageId,
        instance_id: id,
        time: Date.now()
      }
      const summary = `Request error in stage id ${stageId}: ${
        s ? `"${s}"` : ""
      } from stage function for instance "${id}", Stage Id: ${stageId}, Stage Name: ${
        stageInstance.def.name
      } with ${stageInstance.retries || 0} retries`
      stageInstance.error = { summary, ...info }
      if (stageInstance.retries >= 5) {
        instance_state.paused = true
        stageInstance.retries = 0
      }
      console.log(iter.toString().padStart(5, "0"), summary)
      await db("log_entry").insert({
        tags: [stageInstance.def.name, id, stageId],
        summary,
        info,
        level: "error"
      })
    }

    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        const {
          outputs,
          progress,
          state,
          error,
          complete,
          pollFrequency
        } = res.body
        if (!stageInstance.outputs) stageInstance.outputs = {}
        if (outputs !== undefined) {
          // Add progressive flags to output (if missing)
          for (const [outputKey, outputVal] of Object.entries(outputs)) {
            const outputDef = stageInstance.def.outputs[outputKey]
            if (!outputDef) continue
            if (outputDef.progressive) {
              outputs[outputKey] = {
                complete: Boolean(complete),
                ...outputVal,
                progressive: true
              }
            }
          }
          stageInstance.outputs = outputs || {}
        }
        if ((stageInstance.def.outputs || {}).complete)
          stageInstance.outputs.complete = { value: Boolean(complete) }
        if ((stageInstance.def.outputs || {}).is_complete)
          stageInstance.outputs.is_complete = { value: Boolean(complete) }

        stageInstance.pollFrequency = pollFrequency
        if (progress !== undefined) stageInstance.progress = progress
        if (state !== undefined) stageInstance.state = state
        if (error !== undefined) stageInstance.error = error
        if (complete !== undefined) stageInstance.complete = complete
        if (stageInstance.complete) stageInstance.progress = 1
        stageInstance.delay = stageInstance.delay || {
          firstResponseTimestamp: Date.now()
        }
        stageInstance.delay.lastResponseTimestamp = Date.now()

        const {
          firstResponseTimestamp,
          lastResponseTimestamp
        } = stageInstance.delay

        const progressRate =
          (stageInstance.progress + 0.0001) /
          (lastResponseTimestamp - firstResponseTimestamp)

        if (stageInstance.pollFrequency) {
          stageInstance.delay.waitUntil =
            Date.now() + stageInstance.pollFrequency
        } else {
          stageInstance.delay.waitUntil =
            Date.now() +
            Math.min(
              5 * 60 * 1000, // 5 minutes
              (lastResponseTimestamp - firstResponseTimestamp) / 2, // Half the total run time
              (1 - stageInstance.progress) / progressRate / 2 + 1000 // time_until_complete/2 + 1 second
            )
        }

        stageInstance.responseTime = stageInstance.responseTime
          ? (res.timings.end -
              res.timings.start +
              stageInstance.responseTime * 9) /
            10
          : res.timings.end - res.timings.start
      } catch (e) {
        await requestError(`Error parsing body: "${e.toString()}"`)
      }
    } else {
      await requestError()
      continue
    }
  }

  // Compute progress
  // TODO use average completion time for stages to compute more accurate
  // progress
  const progresses = []
  for (const [stageId, stageInstance] of Object.entries(stageInstances)) {
    progresses.push(stageInstance.progress || 0)
  }
  instance_state.progress =
    progresses.reduce((acc, a) => acc + a) / progresses.length

  await db("instance")
    .update({ instance_state })
    .where("id", id)
  await db("system_instance_profile").insert({
    instance_id: id,
    started_at: runInstanceStartTime,
    ended_at: moment()
  })
}

module.exports = runInstance
