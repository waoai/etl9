// @flow

import React from "react"

import { storiesOf } from "@storybook/react"
import { action } from "@storybook/addon-actions"

import PipelineDiagram from "./"

storiesOf("PipelineDiagram", module).add("Basic", () => (
  <div style={{ width: "100vw", height: "100vh" }}>
    <PipelineDiagram
      stages={[
        {
          name: "SomeStage",
          inputs: {
            input1: {
              type: "string"
            },
            input2: {
              type: "string"
            }
          },
          outputs: {
            output1: {
              type: "string"
            }
          }
        }
      ]}
      pipeline={{
        nodes: {
          stage1: {
            name: "SomeStage",
            inputs: {
              input1: { value: "hello" }
            }
          },
          stage2: {
            name: "SomeStage",
            inputs: {
              input1: {
                node: "stage1",
                output: "output1"
              }
            }
          }
        }
      }}
    />
  </div>
))
