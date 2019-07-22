import test from "ava"
import getFixture from "../fixture"
import runController from "../../src/update-loop.js"
import range from "lodash/range"

test("progressive stages pass data to eachother before completion", async t => {
  const {
    db,
    server1,
    server2,
    server3,
    stageAPIURL,
    destroy
  } = await getFixture()

  // First stage is a counter
  server1.callback = ({ state, inputs }) => {
    if (!state) state = { counter: 0 }
    return {
      complete: state.counter + 1 >= inputs.maxCount.value,
      state: { counter: state.counter + 1 },
      outputs: {
        numbers: { value: range(state.counter) }
      }
    }
  }
  await db("definition").insert({
    def: {
      kind: "Stage",
      name: "Counter",
      endpoint: server1.url,
      inputs: {
        maxCount: {
          type: "number"
        },
        waitFor: { type: "any", optional: true }
      },
      outputs: {
        numbers: {
          type: ["number"],
          progressive: true
        }
      }
    }
  })

  // Construct a pipeline where the MultiplierAndCounter don't wait
  await db("instance").insert({
    id: "testinstance",
    params: {
      someparam: "Simple Test Correct Output"
    },
    pipeline_def: {
      kind: "Pipeline",
      name: "TestPipeline",
      nodes: {
        delay: {
          name: "Counter",
          inputs: {
            maxCount: { value: 5 }
          }
        },
        count: {
          name: "Counter",
          inputs: {
            maxCount: { value: 5 },
            waitFor: { node: "delay", output: "numbers", waitForOutput: false }
          }
        }
      }
    }
  })

  let count, delay
  const run = async () => {
    await runController({ db, stageAPIURL, alwaysPoll: true })
    ;({ count, delay } = (await db("instance")
      .where({ id: "testinstance" })
      .first()).instance_state.stageInstances)
  }

  await run()
  t.deepEqual(delay.state, { counter: 1 })
  t.assert(delay.callCount === 1)
  // Instead of waiting for the delay to complete, the counter stage with
  // waitForOutput === false will begin it's execution.
  t.assert(count.callCount === 1)

  await destroy()
})
