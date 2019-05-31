// @flow

const { join } = require("path")
const getDB = require("database").default
const watch = require("watch")
const yaml = require("js-yaml")
const fs = require("fs")
const recursiveReadDir = require("recursive-readdir")

const targetDir = process.env.TARGET_DIR || join(__dirname, "sample-config")
const loadFirst =
  ["yes", "true"].includes((process.env.LOAD_FIRST || "").toLowerCase()) ||
  false

const writeMode =
  ["yes", "true"].includes((process.env.WRITE_MODE || "").toLowerCase()) ||
  false

async function main() {
  const db = await getDB()

  async function loadDir() {
    recursiveReadDir(targetDir, async (err, files) => {
      const documents = []
      for (const fi of files) {
        if (fi.endsWith(".yaml")) {
          const yamlDocs = yaml.safeLoadAll(fs.readFileSync(fi))
          for (const doc of yamlDocs) {
            documents.push(doc)
          }
        }
      }

      await db("definition").del()
      for (const def of documents) {
        await db("definition").insert({ def })
      }
    })
  }

  async function writeToDir() {
    const defs = await db("definition")

    recursiveReadDir(targetDir, async (err, files) => {})
  }

  await loadDir()
  watch.watchTree(targetDir, (f, curr, prev) => {
    loadDir()
  })
}

main()
