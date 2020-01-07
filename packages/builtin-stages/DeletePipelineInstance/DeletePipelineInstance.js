// @flow

const { send, json } = require("micro")
const got = require("got")

let DELETE_DELAY

module.exports = async (req, res) => {
  if (!DELETE_DELAY) DELETE_DELAY = parseInt(process.env.DELETE_DELAY) || 2000

  const { instance_id, inputs, state } = await json(req)

  if (inputs.trigger.value !== true) {
    return { complete: false, progress: 0 }
  }

  // We delay to give the instance controller time to wrap up any operations
  // still going on in the instance
  setTimeout(() => {
    got.delete(
      `${process.env.DB_REST_API_URL ||
        "http://localhost:9102"}/instance?id=eq.${encodeURIComponent(
        instance_id
      )}`
    )
  }, DELETE_DELAY)

  return { complete: true, forcePause: true }
}
