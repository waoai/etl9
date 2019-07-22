import test from "ava"
import getFixture from "../fixture"
import request from "request-promise"

// test("simple fixture should initialize", async t => {
//   const { db, server1, destroy } = await getFixture()
//
//   t.pass("fixture runs")
//
//   await destroy()
// })
//
// test("simple fixture should create servers for callbacks", async t => {
//   const { db, server1, destroy } = await getFixture()
//
//   server1.callback = async params => {
//     return { hello: params.target }
//   }
//
//   const res = await request.post(server1.url, {
//     json: true,
//     body: { target: "world" }
//   })
//
//   t.assert(res.hello === "world")
//
//   await destroy()
// })
//
test("simple fixture should create stage api", async t => {
  const { db, server1, stageAPIURL, destroy } = await getFixture()

  t.assert(stageAPIURL)

  server1.callback = ({ inputs }) => {
    return {
      complete: true,
      outputs: { outputText: { value: inputs.text.value } }
    }
  }
  await db("definition").insert({
    def: {
      kind: "Stage",
      name: "LogOutput",
      endpoint: server1.url,
      inputs: {
        text: { type: "string" }
      }
    }
  })

  const res = await request(`${stageAPIURL}/logoutput`, {
    method: "POST",
    json: true,
    headers: { "content-type": "application/json" },
    body: {
      instance_id: "test-instance-id",
      inputs: {
        text: {
          value: "Test Message"
        }
      }
    }
  })

  t.deepEqual(res, {
    complete: true,
    outputs: { outputText: { value: "Test Message" } }
  })

  await destroy()
})
