// @flow

import React from "react"

import { storiesOf } from "@storybook/react"
import { action } from "@storybook/addon-actions"

import Diagram from "./"

storiesOf("Diagram", module).add("Basic", () => (
  <div style={{ width: "100vw", height: "100vh" }}>
    <Diagram
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
      nodes={{
        id: "demo@0.1.0",
        nodes: {
          stage1: {
            id: "stage1",
            data: {},
            inputs: {},
            outputs: {
              output1: {
                connections: [
                  {
                    node: "stage2",
                    input: "input1"
                  }
                ]
              }
            },
            position: [-285.5, -105.375],
            name: "SomeStage"
          },
          stage2: {
            id: "stage2",
            data: {},
            inputs: {
              input1: {
                connections: [
                  {
                    node: "stage1",
                    output: "output1"
                  }
                ]
              }
            },
            outputs: {},
            position: [-16.5, -99.375],
            name: "SomeStage"
          }
        }
      }}
    />
  </div>
))
