// @flow

import test from "ava"
import getDB from "database"

import micro from "micro"
import http from "http"
import listen from "test-listen"
import app from "../"

import request from "request-promise"

test("LogOutput should log to database", async t => {
  const db = await getDB({ testMode: true, restAPI: true })

  const service = micro(app)
  const url = await listen(service)

  let res
  try {
    res = await request({
      url: `${url}/logoutput`,
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
  } catch (e) {
    t.fail("Request failed: " + e.toString())
  }

  const latestLog = await db("log_entry")
    .orderBy("created_at", "desc")
    .first()

  t.truthy(latestLog)
  t.is(latestLog.summary, "Test Message")
})
