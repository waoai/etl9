// @flow

const LogOutput = require("./LogOutput")
const DummyInput = require("./DummyInput")
const CreatePipelineInstance = require("./CreatePipelineInstance")
const { router, post } = require("microrouter")

module.exports = router(
  post("/logoutput", LogOutput),
  post("/dummyinput", DummyInput),
  post("/createpipelineinstance", CreatePipelineInstance)
)
