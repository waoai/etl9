// @flow

const LogOutput = require("./LogOutput")
const { router, post } = require("microrouter")

module.exports = router(post("/logoutput", LogOutput))
