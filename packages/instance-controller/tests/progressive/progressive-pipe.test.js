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

  // Second multiplies numbers by two AND an independent counter
  server2.callback = ({ inputs, state }) => {
    if (!state) state = { counter: 0 }
    return {
      state: { counter: state.counter + 1 },
      outputs: {
        counter: { value: state.counter },
        multipliedNumbers: inputs.numbers
          ? { value: inputs.numbers.value.map(n => n * 2) }
          : undefined
      }
    }
  }
  await db("definition").insert({
    def: {
      kind: "Stage",
      name: "MultiplierAndCounter",
      endpoint: server2.url,
      inputs: {
        numbers: {
          type: ["number"],
          optional: true,
          progressive: true
        }
      },
      outputs: {
        multipliedNumbers: {
          type: ["number"],
          optional: true
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
            maxCount: { value: 2 }
          }
        },
        count: {
          name: "Counter",
          inputs: {
            maxCount: { value: 5 },
            waitFor: { node: "delay", output: "numbers" }
          }
        },
        countandmult: {
          name: "MultiplierAndCounter",
          inputs: {
            numbers: {
              node: "count",
              output: "numbers"
            }
          }
        }
      }
    }
  })

  let count, delay, countandmult
  const run = async () => {
    await runController({ db, stageAPIURL, alwaysPoll: true })
    ;({ count, delay, countandmult } = (await db("instance")
      .where({ id: "testinstance" })
      .first()).instance_state.stageInstances)
  }

  await run()
  t.assert(count.state === null)
  t.assert(countandmult.state === null)
  t.deepEqual(delay.state, { counter: 1 })
  t.assert(delay.callCount === 1)

  await run()
  t.deepEqual(delay.state, { counter: 2 })
  t.assert(delay.complete)
  t.assert(count.state === null)
  t.assert(countandmult.state === null)

  for (let i = 0; i < 5; i++) {
    t.assert(count.complete === false)
    await run()
    t.deepEqual(count.state, { counter: i + 1 })
    t.assert(countandmult.state.counter === i + 1)
    t.deepEqual(
      countandmult.outputs.multipliedNumbers.value,
      range(i).map(n => n * 2)
    )
  }

  t.assert(count.complete)
  await destroy()
})
