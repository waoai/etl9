// @flow
// require("leaked-handles")

var test = require("ava")
var getDB = require("../")
var request = require("request-promise")
//
// test("connect and disconnect", async t => {
//   t.plan(2)
//   const db = await getDB({ testMode: true })
//
//   const res = await db.raw("SELECT 1+1 as sum")
//   t.assert(res.rows[0].sum === 2)
//
//   await db.destroy()
//   t.pass("should destroy connection")
// })
//
// test("seed", async t => {
//   t.plan(2)
//   const db = await getDB({ seed: true, testMode: true })
//
//   t.assert((await db("definition")).length >= 10)
//
//   await db.destroy()
//   t.pass("should destroy connection")
// })

test("start rest api", async t => {
  const db = await getDB({ testMode: true, seed: true, restAPI: true })

  t.truthy(db.restAPIURL)
  t.assert(!db.restAPIURL.includes("9102"))
  const defs = await request({ uri: db.restAPIURL + "/definition", json: true })
  t.assert(defs.length >= 10)

  await db.destroy()
  t.pass("should destroy connection")
})
