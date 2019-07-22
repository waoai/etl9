// @flow

/*

  Fixture a temporary postgres database and a fake endpoint for usage w/ tests

*/

const getDB = require("../../database")
const listen = require("test-listen")
const micro = require("micro")
const http = require("http")
const microVisualize = require("micro-visualize")

const NUMBER_SERVERS = 3

module.exports = async () => {
  const ret = {}
  ret.db = await getDB({ testMode: true, seed: false })

  // Setting env vars makes sure that the stage API uses the testMode db
  const {
    host,
    port,
    user,
    password,
    database
  } = ret.db.client.config.connection
  process.env.POSTGRES_HOST = host
  process.env.POSTGRES_PORT = port
  process.env.POSTGRES_USER = user
  process.env.POSTGRES_PASS = password
  process.env.POSTGRES_DB = database
  process.env.POSTGRES_DATABASE = database

  for (let i = 0; i < NUMBER_SERVERS; i++) {
    const serverObj = {
      callback: params => ({ echo: params })
    }

    const server = micro(
      microVisualize(async (req, res) => {
        let reqBody
        try {
          reqBody = await micro.json(req)
        } catch (e) {
          micro.send(res, 400, `Error parsing input body:\n\n${e.toString()}`)
          return
        }
        let callbackResponse
        try {
          callbackResponse = await serverObj.callback(reqBody)
        } catch (e) {
          const errString = `Error in TEST SPECIFIED callback:\n\n${e.toString()}`
          console.log(errString)
          micro.send(res, 500, errString)
          return
        }
        if (callbackResponse.length === 2) {
          micro.send(res, ...callbackResponse)
        } else {
          micro.send(res, 200, callbackResponse)
        }
      })
    )

    serverObj.url = await listen(server)

    ret[`server${i + 1}`] = serverObj
  }

  const stageAPI = require("../../stage-api")
  ret.stageAPIURL = await listen(micro(stageAPI))

  ret.destroy = async () => {
    await ret.db.destroy()
  }

  return ret
}
