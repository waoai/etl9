// @flow

const { join, dirname, resolve } = require("path")
const getDB = require("database").default
const watch = require("watch")
const yaml = require("js-yaml")
const fs = require("fs")
const moment = require("moment")
const recursiveReadDir = require("recursive-readdir")
const isEqual = require("lodash/isEqual")
const cloneDeep = require("lodash/cloneDeep")

const defaultTargetDir = resolve(join(__dirname, "sample-config"))
const targetDir = resolve(
  process.env.TARGET_DIR || join(__dirname, "sample-config")
)

const loadFirst = !process.env.LOAD_FIRST
  ? !["yes", "true"].includes((process.env.WRITE_FIRST || "").toLowerCase())
  : ["yes", "true"].includes((process.env.LOAD_FIRST || "").toLowerCase())

const writeMode = !process.env.WRITE_MODE
  ? true
  : ["yes", "true"].includes((process.env.WRITE_MODE || "").toLowerCase())

async function loadBuiltinDocuments() {
  console.log("loading default documents...")
  const defaultFiles = await recursiveReadDir(defaultTargetDir)
  const documents = []
  for (const fi of defaultFiles) {
    if (fi.endsWith(".yaml")) {
      const yamlDocs = yaml.safeLoadAll(fs.readFileSync(fi))
      for (const doc of yamlDocs) {
        if (doc.builtin) {
          documents.push({ def: doc, path: fi })
        }
      }
    }
  }
  console.log(`found ${documents.length} builtins`)
  return documents
}

async function main() {
  console.log(`TARGET CONFIG DIRECTORY: ${targetDir}`)

  const builtinDocuments = await loadBuiltinDocuments()

  const db = await getDB()

  let lastDefScan = null
  let entityIdToFile = {}

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir)
  }

  async function loadDir() {
    const log = (...args) => console.log("load-from-dir>", ...args)

    log("reading target directory...")
    const files = await recursiveReadDir(targetDir)

    log(`${files.length} files found`)
    const documents = []
    for (const fi of files) {
      if (fi.endsWith(".yaml")) {
        const yamlDocs = yaml.safeLoadAll(fs.readFileSync(fi))
        for (const doc of yamlDocs) {
          documents.push({ def: doc, path: fi })
        }
      }
    }
    log(`${documents.length} yaml documents found`)

    for (const builtinDoc of builtinDocuments) {
      if (
        !documents.some(
          d =>
            d.def.name === builtinDoc.def.name &&
            d.def.kind === builtinDoc.def.kind
        )
      ) {
        documents.push(builtinDoc)
      }
    }

    entityIdToFile = {}
    // TODO do this all in a single transaction
    log(`deleting database definitions that no longer exist...`)
    const deleteQ = db("definition").whereNotIn(
      db.raw("def->>'name'"),
      documents.map(doc => doc.def.name)
    )
    const documentsToDelete = (await deleteQ.select(
      db.raw("def->>'name' as name")
    )).map(a => a.name)

    if (documentsToDelete.length > 0) {
      console.log(`deleting ${documentsToDelete.join(",")}`)
      await deleteQ.clone().del()
    } else {
      console.log("no documents to delete")
    }

    log("updating definitions in db...")
    for (const { def, path } of documents) {
      let entity_id
      try {
        ;[{ entity_id }] = await db("definition")
          .insert({ def })
          .returning("entity_id")
        log(`inserted def "${def.name}"...`)
      } catch (e) {
        const existingDef = (await db("definition")
          .where(db.raw("def->>'name'"), def.name)
          .select("def")
          .first()).def
        if (!isEqual(existingDef, def)) {
          if (e.toString().includes("duplicate key value")) {
            ;[{ entity_id }] = await db("definition")
              .update({ def })
              .where(db.raw("def->>'name'"), def.name)
              .returning("entity_id")
            log(`updated def "${def.name}"...`)
          }
        }
      }
      entityIdToFile[entity_id] = { path, def }
    }
    log(`done`)
    lastDefScan = Date.now()
  }

  async function writeToDir() {
    const log = (...args) => console.log("write-to-dir>", ...args)
    log("attempting to write to target directory...")
    const contents = await new Promise(async onCompleteWrite => {
      log("reading target directory...")
      const files = await recursiveReadDir(targetDir)
      log(`${files.length} files found`)
      const contents = {}
      for (const fi of files) {
        contents[fi] = yaml.safeLoadAll(fs.readFileSync(fi))
      }
      log("finished loading yaml.")
      onCompleteWrite(contents)
    })

    const dirContents = cloneDeep(contents)

    log("reading definitions from database...")
    const newDefs = (await db("definition").where(
      "updated_at",
      ">",
      moment.utc(lastDefScan || 0)
    )).filter(({ def }) => def.builtin !== true)
    log(`${newDefs.length} updated definitions found`)

    lastDefScan = Date.now()
    const changedFiles = new Set()

    for (const { entity_id, def: newDef } of newDefs) {
      // if this is an existing definition, replace it in the original file
      if (entityIdToFile[entity_id]) {
        const { path: prevPath, def: prevDef } = entityIdToFile[entity_id]

        // Check that the definition hasn't moved
        if (
          contents[prevPath] &&
          contents[prevPath].some(d => d.name === prevDef.name)
        ) {
          // Replace the previous definition with the new definition
          contents[prevPath] = contents[prevPath].map(d =>
            d.name === prevDef.name ? newDef : d
          )
          changedFiles.add(prevPath)
          continue
        }
      }

      // New definition should be placed in a reasonable location
      const newPath = join(
        targetDir,
        newDef.kind.toLowerCase() + "s",
        newDef.name + ".yaml"
      )

      contents[newPath] = [newDef]
      changedFiles.add(newPath)
    }

    log(`${changedFiles.size} files changed`)

    if (changedFiles.size === 0) return

    log(`Writing changed files to target directory...`)
    for (const changedFilePath of changedFiles) {
      fs.mkdirSync(dirname(changedFilePath), { recursive: true })
      fs.writeFileSync(
        changedFilePath,
        contents[changedFilePath].map(doc => yaml.safeDump(doc)).join("\n---\n")
      )
    }
    log(`done`)
  }

  if (loadFirst) {
    console.log("Loading config from directory (LOAD_FIRST)...")
    await loadDir()
  } else {
    console.log("Writing config to directory (WRITE_FIRST)...")
    await writeToDir()
  }

  setTimeout(() => {
    console.log("Watching config directory for changes...")
    watch.watchTree(targetDir, { interval: 0.1 }, (f, curr, prev) => {
      loadDir()
    })
  }, 500)
  if (writeMode) {
    async function checkDBAndWrite() {
      const { count } = await db("definition")
        .where("updated_at", ">", moment.utc(lastDefScan || 0))
        .count()
        .first()
      if (parseInt(count) > 0) {
        await writeToDir()
      }
      setTimeout(checkDBAndWrite, 200)
    }
    checkDBAndWrite()
  }
}

main()
