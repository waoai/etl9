// @flow

import test from "ava"
import micro from "micro"
import http from "http"
import listen from "test-listen"
import got from "got"
import app from "../"
import getDB from "database"
import LogOutput from "builtin-stages/LogOutput"

test('run via stage function "log output"', async t => {
  const db = await getDB({ testMode: true, seed: true, restAPI: true })

  const service = micro(app)
  const url = await listen(service)

  const logOutputUrl = await listen(micro(LogOutput))

  await db("stage_def")
    .update({
      def: {
        kind: "Stage",
        name: "LogOutput",
        description: "Log Output to ETL9 Server",
        endpoint: logOutputUrl,
        inputs: {
          input: {
            type: "any"
          }
        }
      }
    })
    .where({ name: "LogOutput" })

  const res = await got(`${url}/logoutput`, {
    method: "POST",
    json: true,
    headers: { "content-type": "application/json" },
    body: {
      instance_id: "test-instance-id",
      inputs: {
        input: {
          value: "Test Message"
        }
      }
    }
  })

  t.is(res.statusCode, 200)
  t.deepEqual(res.body, { complete: true })
})
