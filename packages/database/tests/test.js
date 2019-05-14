// @flow
// require("leaked-handles")

var test = require("tape")
var getDB = require("../build/bundle").default

test("connect and disconnect", async t => {
  t.plan(1)
  const db = await getDB({ seed: true, testMode: true })

  await db.destroy()
  t.pass("should destroy connection")
})
