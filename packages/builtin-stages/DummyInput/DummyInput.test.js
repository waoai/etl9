// @flow

import test from "ava"
import getDB from "database"

import micro from "micro"
import http from "http"
import listen from "test-listen"
import app from "../"

import got from "got"

test("DummyInput should output", async t => {
  const db = await getDB({ testMode: true, restAPI: true })

  const service = micro(app)
  const url = await listen(service)

  const res1 = await got(`${url}/dummyinput`, {
    method: "POST",
    json: true,
    headers: { "content-type": "application/json" },
    body: {
      instance_id: "test-instance-id",
      inputs: {
        input: {
          value: "Test Output"
        },
        delay: {
          value: 1000
        }
      }
    }
  })

  t.is(res1.statusCode, 200)
  t.assert(res1.body.progress < 0.01)

  await new Promise(resolve => setTimeout(resolve, 500))

  const res2 = await got(`${url}/dummyinput`, {
    method: "POST",
    json: true,
    headers: { "content-type": "application/json" },
    body: {
      instance_id: "test-instance-id",
      state: res1.body.state,
      inputs: {
        input: {
          value: "Test Output"
        },
        delay: {
          value: 1000
        }
      }
    }
  })

  t.assert(res2.body.progress > 0.4)
  t.assert(res2.body.progress < 0.7)

  await new Promise(resolve => setTimeout(resolve, 500))

  const res3 = await got(`${url}/dummyinput`, {
    method: "POST",
    json: true,
    headers: { "content-type": "application/json" },
    body: {
      instance_id: "test-instance-id",
      state: res2.body.state,
      inputs: {
        input: {
          value: "Test Output"
        },
        delay: {
          value: 1000
        }
      }
    }
  })

  t.assert(res3.body.complete)
  t.assert(res3.body.outputs.output.value === "Test Output")
})
