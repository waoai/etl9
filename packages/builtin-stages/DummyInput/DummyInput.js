// @flow

const { send, json } = require("micro")
const got = require("got")

module.exports = async (req, res) => {
  const { instance_id, inputs, state } = await json(req)

  const v = inputs.input.value

  return { complete: true }
}
