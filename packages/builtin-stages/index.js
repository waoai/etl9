// @flow

const LogOutput = require("./LogOutput")
const DummyInput = require("./DummyInput")
const CreatePipelineInstance = require("./CreatePipelineInstance")
const DeletePipelineInstance = require("./DeletePipelineInstance")
const CountUp = require("./CountUp")
const ETL9Event = require("./ETL9Event")
const { router, post } = require("microrouter")

module.exports = router(
  post("/logoutput", LogOutput),
  post("/dummyinput", DummyInput),
  post("/createpipelineinstance", CreatePipelineInstance),
  post("/countup", CountUp),
  post("/etl9event", ETL9Event),
  post("/deletepipelineinstance", DeletePipelineInstance)
)
