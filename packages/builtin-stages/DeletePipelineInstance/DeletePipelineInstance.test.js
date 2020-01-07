// @flow

import test from "ava"
import getDB from "database"

import micro from "micro"
import http from "http"
import listen from "test-listen"
import app from "../"

import request from "request-promise"

test("DeletePipelineInstance should delete it's pipeline when triggered", async t => {
  process.env.DELETE_DELAY = 100
  const db = await getDB({ testMode: true, restAPI: true })

  await db("instance").insert({
    id: "test-instance-id",
    params: {},
    pipeline_def: {},
    instance_state: {}
  })

  const service = micro(app)
  const url = await listen(service)

  let res
  try {
    res = await request({
      url: `${url}/deletepipelineinstance`,
      method: "POST",
      json: true,
      headers: { "content-type": "application/json" },
      body: {
        instance_id: "test-instance-id",
        inputs: {
          trigger: {
            value: true
          }
        }
      }
    })
  } catch (e) {
    t.fail("Request failed: " + e.toString())
  }

  t.truthy(res.complete)
  t.truthy(res.forcePause)

  t.truthy(
    await db("instance")
      .first()
      .where({ id: "test-instance-id" })
  )

  await new Promise(resolve => setTimeout(resolve, 200))

  t.falsy(
    await db("instance")
      .first()
      .where({ id: "test-instance-id" })
  )
})
