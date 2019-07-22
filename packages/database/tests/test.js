// @flow
// require("leaked-handles")

var test = require("ava")
var getDB = require("../")

test("connect and disconnect", async t => {
  t.plan(1)
  const db = await getDB({ testMode: true })

  await db.destroy()
  t.pass("should destroy connection")
})

test("seed", async t => {
  t.plan(1)
  const db = await getDB({ seed: true, testMode: true })

  t.assert((await db("definition")).length > 10)

  await db.destroy()
  t.pass("should destroy connection")
})
