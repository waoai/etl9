import test from "ava"
import getFixture from "../fixture"
import runController from "../../src/update-loop.js"

test("simple standalone instance should take input and output it", async t => {
  const { db, server1, stageAPIURL, destroy } = await getFixture()

  await db("definition").insert({
    def: {
      kind: "Type",
      name: "StringType",
      superstruct: '"string"'
    }
  })

  await db("definition").insert({
    def: {
      kind: "Stage",
      name: "Input2Output",
      endpoint: server1.url,
      inputs: {
        somestring: {
          type: "StringType"
        }
      },
      outputs: {
        someoutput: {
          type: "StringType"
        }
      }
    }
  })

  await db("instance").insert({
    id: "testinstance",
    params: {
      someparam: "Simple Test Correct Output"
    },
    pipeline_def: {
      kind: "Pipeline",
      name: "TestPipeline",
      nodes: {
        input2output: {
          name: "Input2Output",
          inputs: {
            somestring: { param: "someparam" }
          }
        }
      }
    }
  })

  const $bodySentToEndpoint = new Promise(resolve => {
    server1.callback = body => {
      resolve(body)
      return {
        complete: true,
        outputs: {
          someoutput: {
            value: body.inputs.somestring.value
          }
        }
      }
    }
  })

  await runController({ db, stageAPIURL })

  // const bodySentToEndpoint = await $bodySentToEndpoint

  let instance = await db("instance")
    .where({ id: "testinstance" })
    .first()

  const { instance_state: state } = instance

  t.assert(state.progress === 1)
  t.assert(state.stageInstances.input2output)
  t.deepEqual(state.stageInstances.input2output.outputs, {
    someoutput: { value: "Simple Test Correct Output" }
  })

  await destroy()
})
