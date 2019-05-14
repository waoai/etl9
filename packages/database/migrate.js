const getDB = require("./").default
const fs = require("fs")

console.log("beginning migration")
console.log("connecting to db...")
getDB().then(db => {
  console.log("connected to db")
  console.log("attempting to apply migration...")
  db.raw(fs.readFileSync("./migrate.sql").toString()).then(() => {
    console.log("migration applied")
    console.log("destroying connection...")
    db.destroy().then(() => {
      console.log("migration successful")
      process.exit(0)
    })
  })
})
