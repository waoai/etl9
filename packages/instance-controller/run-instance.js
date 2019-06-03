// @flow

const got = require("got")

let iter = 0
async function runInstance(
  { db },
  { instance_state, params, pipeline_def, id }
) {
  iter++
  // Initialize state if not initialized
  if (!instance_state) {
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

    // Can this stage be run?
    const inputsWithValues = {}
    for (const [inputKey, input] of Object.entries(inputs)) {
      if (input.node) {
        const nodeStageInstance = stageInstances[input.node]
        if (nodeStageInstance.complete || input.progressive) {
          inputsWithValues[inputKey] = nodeStageInstance.outputs[input.output]
        } else {
          stageInstance.error = `Waiting on "${input.node}".outputs["${
            input.output
          }"]`
          break
        }
      } else if (input.param) {
        inputsWithValues[inputKey] = { value: params[input.param] }
      } else if (input.value) {
        inputsWithValues[inputKey] = { value: input.value }
      }
    }

    if (stageInstance.error) continue

    // Hit the endpoint...
    const requestBody = {
      state: stageInstance.state,
      inputs: inputsWithValues,
      instance_id: id
    }
    let res
    try {
      res = await got(
        `http://localhost:9123/api/stage/${stageInstance.def.name}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          json: true,
          body: requestBody
        }
      )
    } catch (e) {
      const info = {
        statusCode: e.response.statusCode,
        message: e.response.body,
        requestBody,
        stageId,
        instance_id: id
      }
      const summary = `Error in stage id "${stageId}" calling out to stage function "${
        stageInstance.def.name
      }". Code ${info.statusCode}. Response body "${info.message}"`
      console.log(iter.toString().padStart(5, "0"), summary)
      await db("log_entry").insert({
        tags: [stageInstance.def.name, id, stageId],
        summary,
        info,
        level: "error"
      })
      stageInstance.error = summary
      continue
    }

    if (res.statusCode >= 200 && res.statusCode < 300) {
      const { outputs, progress, state, error, complete } = res.data
      if (outputs !== undefined) stageInstance.outputs = outputs
      if (progress !== undefined) stageInstance.progress = progress
      if (state !== undefined) stageInstance.state = state
      if (error !== undefined) stageInstance.error = error
      if (complete !== undefined) stageInstance.complete = complete
    } else {
      const info = {
        statusCode: res.statusCode,
        message: res.data,
        requestBody,
        stageId,
        instance_id: id
      }
      const summary = `Error response from stage function for instance "${id}", Stage Id: ${stageId}, Stage Name: ${
        stageInstance.def.name
      }`
      stageInstance.error = summary
      console.log(iter.toString().padStart(5, "0"), summary)
      await db("log_entry").insert({
        tags: [stageInstance.def.name, id, stageId],
        summary,
        info,
        level: "error"
      })
      continue
    }
  }

  await db("instance")
    .update({ instance_state })
    .where("id", id)
}

module.exports = runInstance
