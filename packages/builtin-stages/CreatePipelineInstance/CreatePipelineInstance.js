// @flow

const { send, json } = require("micro")
const request = require("request-promise")
const flat = require("flat")

module.exports = async (req, res) => {
  let { instance_id, inputs, state } = await json(req)

  let {
    pipelineName: { value: pipelineName },
    instanceName: { value: templateInstanceName } = { value: "" },
    params: { value: params }
  } = inputs

  if (!state) state = { lastCreatedInstanceIndex: -1, createdInstanceIds: [] }

  if (params.length <= state.lastCreatedInstanceIndex + 1)
    return { state, pollFrequency: 1000 * 10 }
  // Get latest pipeline definition
  const pipelineDefs = await request({
    uri: "http://localhost:9102/pipeline_def",
    qs: { name: `eq.${pipelineName}` },
    json: true
  })

  if (pipelineDefs.length === 0) {
    throw new Error(`Pipeline "${pipelineName}" not found`)
  }

  // New instances need to be created
  for (let i = state.lastCreatedInstanceIndex + 1; i < params.length; i++) {
    let instanceName = templateInstanceName

    const flattenedParams = flat(params[i])
    for (const [key, value] of Object.entries(flattenedParams)) {
      instanceName = instanceName.replace(`{${key}}`, flattenedParams[key])
    }

    const result = await request({
      uri: "http://localhost:9102/instance",
      method: "POST",
      json: true,
      headers: {
        "content-type": "application/json",
        Prefer: "return=representation"
      },
      body: {
        id: instanceName ? instanceName : undefined,
        pipeline_def: pipelineDefs[0].def,
        params: params[i]
      }
    })
    state.createdInstanceIds.push(result[0].id)
  }
  state.lastCreatedInstanceIndex = params.length - 1

  return {
    state,
    pollFrequency: 1000 * 10
  }
}
