// @flow

import test from "ava"
import getDB from "database"

import micro from "micro"
import http from "http"
import listen from "test-listen"
import app from "../"

import got from "got"

test("DummyInput should output", async t => {
  const db = await getDB()

  const service = micro(app)
  const url = await listen(service)

  const res = await got(`${url}/dummyinput`, {
    method: "POST",
    json: true,
    headers: { "content-type": "application/json" },
    body: {
      instance_id: "test-instance-id",
      inputs: {
        input: {
          value: "Test Output"
        }
      }
    }
  })

  t.is(res.statusCode, 200)

  // TODO check output
})
