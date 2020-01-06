// @flow

import test from "ava"
import getDB from "database"

import micro from "micro"
import http from "http"
import listen from "test-listen"
import app from "../"

import request from "request-promise"

test("ETL9Event should log to database", async t => {
  const db = await getDB({ testMode: true, restAPI: true })

  const service = micro(app)
  const url = await listen(service)

  const res = await request(`${url}/etl9event`, {
    method: "POST",
    json: true,
    headers: { "content-type": "application/json" },
    body: {
      instance_id: "test-instance-id",
      inputs: {
        event: {
          value: "StagePausedOnError"
        }
      }
    }
  })

  t.truthy(res)
  t.truthy(res.outputs.logs.value)
  t.assert(res.outputs.logs.value.length === 0)

  await db("log_entry").insert({
    tags: ["StagePausedOnError", "some-stage-id"],
    summary: "Test Error",
    info: {},
    level: "error"
  })

  await db("log_entry").insert({
    tags: ["some-stage-id"],
    summary: "Test Error",
    info: {},
    level: "info"
  })

  const res2 = await request(`${url}/etl9event`, {
    method: "POST",
    json: true,
    headers: { "content-type": "application/json" },
    body: {
      instance_id: "test-instance-id",
      inputs: {
        event: {
          value: "StagePausedOnError"
        }
      },
      state: res.state
    }
  })

  t.truthy(res2)
  t.truthy(res2.outputs.logs.value)
  t.assert(res2.outputs.logs.value.length === 1)

  await db("log_entry").insert({
    tags: ["StagePausedOnError", "some-stage-id-2"],
    summary: "Test Error 2",
    info: {},
    level: "error"
  })

  const res3 = await request(`${url}/etl9event`, {
    method: "POST",
    json: true,
    headers: { "content-type": "application/json" },
    body: {
      instance_id: "test-instance-id",
      inputs: {
        event: {
          value: "StagePausedOnError"
        }
      },
      state: res2.state
    }
  })

  t.truthy(res3)
  t.truthy(res3.outputs.logs.value)
  t.assert(res3.outputs.logs.value.length === 2)
})
