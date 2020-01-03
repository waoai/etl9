// @flow

const path = require("path")
const qspg = require("qspg").default
const runSeed = require("./seed")
const { spawn } = require("child_process")
const getPort = require("get-port")

module.exports = async ({
  testMode = false,
  seed = false,
  restAPI = false
} = {}) => {
  if (!process.env.POSTGRES_DB) process.env.POSTGRES_DB = "etl9"
  const conn = await qspg({
    migrationsDir: path.resolve(__dirname, "./migrations"),

    // Optional: If set to true, QSPG will create a database with a randomized name, this is
    // great for unit tests. Defaults to true only if USE_TEST_DB env var is set.
    testMode
  })

  if (seed) {
    await runSeed(conn)
  }

  if (restAPI) {
    console.log("starting db REST api (postgrest)")
    const restAPIProjectDir = path.resolve(__dirname, "..", "database-rest-api")
    conn.restAPIPort = await getPort()
    conn.restAPIURL = `http://localhost:${conn.restAPIPort}`
    const {
      host: POSTGRES_HOST,
      port: POSTGRES_PORT,
      user: POSTGRES_USER,
      password: POSTGRES_PASS,
      database: POSTGRES_DB
    } = conn.client.config.connection
    const restAPIProcess = spawn(
      "postgrest",
      [path.resolve(restAPIProjectDir, "postgrest.conf")],
      {
        cwd: restAPIProjectDir,
        env: {
          PATH: process.env.PATH,
          POSTGRES_USER,
          POSTGRES_PORT,
          POSTGRES_PASS,
          POSTGRES_DB,
          POSTGRES_HOST,
          PORT: conn.restAPIPort
        }
      }
    )
    let connectionSuccessfulCallback
    restAPIProcess.stdout.on("data", data => {
      console.log("DB REST:", data.toString())
      if (
        data
          .toString()
          .toLowerCase()
          .includes("connection successful")
      ) {
        connectionSuccessfulCallback()
      }
    })
    restAPIProcess.stderr.on("data", data => {
      console.log("DB REST ERR:", data.toString())
      console.error("DB REST ERR:", data.toString())
    })
    const oldDestroy = conn.destroy
    conn.destroy = () => {
      console.log("destroying")
      restAPIProcess.kill()
      return oldDestroy()
    }
    await new Promise(resolve => (connectionSuccessfulCallback = resolve))
    console.log("Postgrest started")
  } else {
    conn.restAPIPort = 9102
    conn.restAPIURL = `http://localhost:9102`
  }

  return conn
}
