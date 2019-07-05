// @flow

const got = require("got")

let iter = 0
async function runInstance(
  { db },
  { instance_state, params, pipeline_def, id }
) {
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
    stageInstance.error = null
    const { def, inputs, state, complete } = stageInstance
    if (complete) continue

    if (
      stageInstance.delay &&
      stageInstance.delay.waitUntil &&
      Date.now() < stageInstance.delay.waitUntil
    )
      continue

    // Can this stage be run?
    const inputsWithValues = {}
    for (const [inputKey, input] of Object.entries(inputs)) {
      if (input.node) {
        const nodeStageInstance = stageInstances[input.node]
        if (nodeStageInstance.complete || input.progressive) {
          inputsWithValues[inputKey] = nodeStageInstance.outputs[input.output]
        } else {
          stageInstance.error = {
            summary: `Waiting on "${input.node}".outputs["${input.output}"]`
          }
          break
        }
      } else if (input.param) {
        const value = params[input.param]
        if (typeof value === "string" && value.startsWith("$")) {
          inputsWithValues[inputKey] = {
            value: envVarMap[value.slice(1)]
          }
        } else {
          inputsWithValues[inputKey] = { value }
        }
      } else if (input.value) {
        inputsWithValues[inputKey] = { value: input.value }
      }
    }

    if (stageInstance.error) continue

    // Hit the endpoint...
    const requestBody = {
      state: stageInstance.state,
      inputs: inputsWithValues,
      stage_id: stageId,
      instance_id: id
    }
    let res
    const endpoint = `http://localhost:9123/api/stage/${stageInstance.def.name}`
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
        statusCode: e.response.statusCode,
        message: e.response.body,
        requestBody,
        stageId,
        endpoint,
        instance_id: id
      }
      const summary = `Error in stage id "${stageId}" calling stage function "${
        stageInstance.def.name
      }". Code ${info.statusCode}. Response body "${info.message}"`
      console.log(iter.toString().padStart(5, "0"), summary)
      await db("log_entry").insert({
        tags: [stageInstance.def.name, id, stageId],
        summary,
        info,
        level: "error"
      })
      stageInstance.error = { summary, ...info }
      instance_state.paused = true
      continue
    }

    const requestError = async s => {
      const info = {
        statusCode: res.statusCode,
        endpoint,
        message: res.body,
        requestBody,
        stageId,
        instance_id: id
      }
      const summary = `Error ${
        s ? `"${s}"` : ""
      } from stage function for instance "${id}", Stage Id: ${stageId}, Stage Name: ${
        stageInstance.def.name
      }`
      stageInstance.error = { summary, ...info }
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
        const { outputs, progress, state, error, complete } = res.body
        if (outputs !== undefined) stageInstance.outputs = outputs
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
              30 * 60 * 60 * 1000, // 30 minutes
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
}

module.exports = runInstance
