// @flow

import test from "ava"
import micro from "micro"
import http from "http"
import listen from "test-listen"
import got from "got"
import app from "../"
import getDB from "database"

test('run via stage function "log output"', async t => {
  const service = micro(app)
  const url = await listen(service)

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
