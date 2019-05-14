// @flow

import knex from "knex"
import migrationSQL from "./migrate.sql"
import seedSQL from "./seed.sql"

const getConnectionInfo = (database, user) => ({
  host: process.env.POSTGRES_HOST || "localhost",
  user: user || process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASS || "",
  database
})

const createDatabase = async dbName => {
  try {
    let conn = await knex({
      client: "pg",
      connection: getConnectionInfo("postgres")
    })
    await conn.raw(`CREATE DATABASE ${dbName}`)
    await conn.destroy()
  } catch (e) {}
}

const deleteDatabase = async dbName => {
  try {
    let conn = await knex({
      client: "pg",
      connection: getConnectionInfo("postgres")
    })
    await conn.raw(`DROP DATABASE ${dbName}`)
    await conn.destroy()
  } catch (e) {}
}

export default async ({ seed, testMode, user } = {}) => {
  testMode =
    testMode === undefined ? Boolean(process.env.USE_TEST_DB) : testMode

  const dbName = !testMode
    ? process.env.POSTGRES_DB || "planner"
    : `testdb_${Math.random()
        .toString(36)
        .slice(7)}`

  if (testMode)
    console.log(`\n---\nUsing Test DB: ${dbName}, User: ${user || "none"}\n---`)

  await createDatabase(dbName)

  let pg = knex({
    client: "pg",
    connection: getConnectionInfo(dbName)
  })

  // test connection
  try {
    await pg.raw("select 1+1 as result")
  } catch (e) {
    throw new Error("Could not connect to database\n\n" + e.toString())
  }

  // upload migration
  await pg.raw(migrationSQL)

  if (seed) await pg.raw(seedSQL)

  if (user) {
    await pg.destroy()
    pg = knex({ client: "pg", connection: getConnectionInfo(dbName, user) })
    // test connection
    try {
      await pg.raw("select 1+1 as result")
    } catch (e) {
      throw new Error(
        `Could not connect to database as "${user}"\n\n${e.toString()}`
      )
    }
  }

  // override pg.destroy so we can delete the test database
  const _destroy = pg.destroy
  pg.destroy = async () => {
    await _destroy()
    if (testMode) await deleteDatabase(dbName)
  }

  return pg
}
