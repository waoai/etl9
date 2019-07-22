// @flow

const getDB = require("database")
const loop = require("./update-loop.js")

async function main() {
  const db = await getDB()
  loop({ db, repeat: true })
}

main()
