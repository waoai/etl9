// @flow

const LogOutput = require("./LogOutput")
const DummyInput = require("./DummyInput")
const { router, post } = require("microrouter")

module.exports = router(
  post("/logoutput", LogOutput),
  post("/dummyinput", DummyInput)
)
