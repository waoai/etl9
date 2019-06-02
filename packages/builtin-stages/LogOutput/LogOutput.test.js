// @flow

import test from "ava"
import getDB from "database"

import micro from "micro"
import http from "http"
import listen from "test-listen"
import app from "../"

import got from "got"

test("LogOutput should log to database", async t => {
  const db = await getDB()

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

  const latestLog = await db("log_entry")
    .orderBy("created_at", "desc")
    .first()

  t.truthy(latestLog)
  t.is(latestLog.summary, "Test Message")

  t.pass("success")

  // console.log(latestLog)
})
