// @flow

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

    // Hit the endpoint to run...
    // TODO hit the stage api
  }

  await db("instance")
    .update({ instance_state })
    .where("id", id)
}
