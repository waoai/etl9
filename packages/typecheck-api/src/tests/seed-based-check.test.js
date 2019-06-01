// @flow

import test from "ava"
import micro from "micro"
import http from "http"
import listen from "test-listen"
import got from "got"
import app from "../"
import getDB from "database"

test("check types from seed", async t => {
  const service = micro(app)
  const url = await listen(service)
  // const db = await getDB({ seed: true, testMode: true })

  let res
  try {
    res = await got(url, {
      method: "POST",
      json: true,
      headers: { "content-type": "application/json" },
      body: {
        typeName: "FileList",
        object: [
          { url: "http://example.com/test1.txt" },
          { url: "http://example.com/dir/test2.txt" }
        ]
      }
    })
  } catch (e) {
    throw new Error(`${e.response.statusCode}: ${e.response.body}`)
  }

  t.is(res.statusCode, 200)
  t.deepEqual(res.body, { valid: true })

  try {
    res = await got(url, {
      method: "POST",
      json: true,
      headers: { "content-type": "application/json" },
      body: {
        typeName: "FileList",
        // NOTE: this type is an invalid FileList
        object: [{ url: "http://example.com/test1.txt" }, { url: 3 }]
      }
    })
  } catch (e) {
    t.pass("expected error with malformed type submission")
    return
  }
  t.fail("did not get expected error for malformed type")
})
