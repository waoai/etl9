// @flow

const { send, json } = require("micro")
const request = require("request-promise")
const getDB = require("database")
const moment = require("moment")

let db
module.exports = async (req, res) => {
  try {
    db = db || (await getDB())
    const { instance_id, stage_id, inputs, state } = await json(req)

    const {
      event: { value: event }
    } = inputs

    let { lastChecked, logs } = state || { lastChecked: Date.now(), logs: [] }

    // See if any recent log entries have the tag
    const newLogs = await db("log_entry")
      .whereRaw(`tags @> '{${event}}'`)
      .where("created_at", ">", new Date(lastChecked))

    logs = logs.concat(newLogs).slice(-50)

    return {
      progress: 0,
      complete: false,
      outputs: {
        logs: {
          value: logs
        }
      },
      state: { lastChecked: Date.now(), logs: logs }
    }
  } catch (e) {
    return send(res, 500, e.toString())
  }
}
