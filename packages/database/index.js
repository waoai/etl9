// @flow

const path = require("path")
const qspg = require("qspg").default
const runSeed = require("./seed")

module.exports = async ({ testMode = false, seed = false } = {}) => {
  const conn = await qspg({
    migrationsDir: path.resolve(__dirname, "./migrations"),

    // Optional: If set to true, QSPG will create a database with a randomized name, this is
    // great for unit tests. Defaults to true only if USE_TEST_DB env var is set.
    testMode
  })

  if (seed) {
    await runSeed(conn)
  }

  return conn
}
