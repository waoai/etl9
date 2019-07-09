// @flow

const { send, json } = require("micro")
const request = require("request-promise")
const range = require("lodash/range")

module.exports = async (req, res) => {
  let { instance_id, inputs, state } = await json(req)

  const {
    max: { value: max } = { value: Infinity },
    start: { value: start } = { value: 0 },
    frequency: { value: frequency } = { value: 1000 }
  } = inputs

  if (!state) state = { currentIndex: start, startTime: Date.now() }

  if (
    Date.now() >
    state.startTime + frequency * (1 + state.currentIndex - start)
  ) {
    state.currentIndex++
  }

  return {
    progress: (state.currentIndex - start) / (max - start),
    complete: state.currentIndex >= max,
    outputs: { count: { value: range(start, state.currentIndex) } },
    state,
    pollFrequency: frequency
  }
}
