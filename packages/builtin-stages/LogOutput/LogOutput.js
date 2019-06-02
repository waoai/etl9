// @flow

const { send, json } = require("micro")
const got = require("got")

module.exports = async (req, res) => {
  const { instance_id, inputs, state } = await json(req)

  const v = inputs.input.value

  await got.post(`http://localhost:9102/log_entry`, {
    headers: { "content-type": "application/json" },
    json: true,
    body: {
      tags: [instance_id],
      summary:
        typeof v === "string"
          ? v.slice(0, 200)
          : JSON.stringify(v).slice(0, 200),
      info: {
        type: "LogOutput",
        value: v
      },
      level: "info"
    }
  })

  return { complete: true }
}
