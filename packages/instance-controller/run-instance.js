// @flow

const got = require("got")

async function runInstance(
  { db },
  { instance_state, params, pipeline_def, id }
) {
  // Initialize state if not initialized
  if (!instance_state) {
    const stageInstances = {}
    for (const [stageId, stageInfo] of Object.entries(pipeline_def.nodes)) {
      // TODO make all the stage definition calls at once
      const stageDef = (await db("stage_def")
        .where({ name: stageInfo.name })
        .select("def")
        .first()).def
      stageInstances[stageId] = {
        stageName: stageInfo.name,
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
    for (const [inputKey, input] in Object.entries(inputs)) {
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
    const res = await got(
      `http://localhost:9123/api/stage/${stageInstance.def.name}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        json: true,
        body: {
          state: stageInstance.state,
          inputs: inputsWithValues,
          instance_id: id
        }
      }
    )

    if (res.statusCode >= 200 && res.statusCode < 300) {
      const { outputs, progress, state, error, complete } = res.data
      if (outputs !== undefined) stageInstance.outputs = outputs
      if (progress !== undefined) stageInstance.progress = progress
      if (state !== undefined) stageInstance.state = state
      if (error !== undefined) stageInstance.error = error
      if (complete !== undefined) stageInstance.complete = complete
    } else {
      const summary = `error executing stage function for instance "${id}", Stage Id: ${stageId}, Stage Name: ${
        stageInstance.def.name
      }`
      console.log(summary)
    }
  }

  await db("instance")
    .update({ instance_state })
    .where("id", id)
}
