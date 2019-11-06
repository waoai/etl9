// @flow

const { send, json } = require("micro")
const request = require("request-promise")

module.exports = async (req, res) => {
  let { instance_id, inputs, state } = await json(req)

  const {
    pipelineName: { value: pipelineName },
    params: { value: params }
  } = inputs

  if (!state) state = { lastCreatedInstanceIndex: -1, createdInstanceIds: [] }

  if (params.length <= state.lastCreatedInstanceIndex + 1) return { state, pollFrequency: 1000 * 10 }
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
    const result = await request({
      uri: "http://localhost:9102/instance",
      method: "POST",
      json: true,
      headers: {
        "content-type": "application/json",
        Prefer: "return=representation"
      },
      body: {
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
