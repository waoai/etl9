// @flow

const { send, json } = require("micro")
const got = require("got")

module.exports = async (req, res) => {
  const { instance_id, inputs, state = {} } = await json(req)

  if (!state.startTime) state.startTime = Date.now()

  if (inputs.delay.value) {
    if (Date.now() - state.startTime < inputs.delay.value) {
      return {
        state,
        progress: (Date.now() - state.startTime) / inputs.delay.value
      }
    }
  }

  const { value } = inputs.input

  return {
    complete: true,
    state,
    outputs: {
      output: value
    }
  }
}
