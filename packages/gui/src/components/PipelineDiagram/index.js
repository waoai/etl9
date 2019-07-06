// @flow

import React from "react"
import Diagram from "../Diagram"
import cloneDeep from "lodash/cloneDeep"
import set from "lodash/set"

type Pipeline = {
  nodes: {
    [nodeName: string]: {
      name: string,
      inputs: {
        [inputKey: string]:
          | { value: any }
          | { node: string, output: string }
          | { param: string }
      }
    }
  }
}

export const PipelineDiagram = ({
  stages,
  pipeline,
  onChange = () => null
}: {
  stages: Array,
  pipeline: Pipeline,
  onChange: Pipeline => any
}) => {
  if (!pipeline || !pipeline.nodes) return null
  if (Object.keys(pipeline.nodes).length === 0) return null
  try {
    // Try to construct the rete node structure from the Pipeline format

    // Stage 1: Create nodes representing any "value" pipeline connections
    const pipelineNodes = cloneDeep(pipeline.nodes)

    // Stage 2: Create the output connections
    const nodeOutputConnections = Object.keys(pipelineNodes).reduce(
      (nodeOutputConnections, nodeKey) => {
        const node = pipelineNodes[nodeKey]
        for (const inputKey in node.inputs) {
          const inp:
            | { value: any }
            | { output: string, node: string }
            | { param: string } = node.inputs[inputKey]
          if (inp.node) {
            nodeOutputConnections[inp.node] =
              nodeOutputConnections[inp.node] || {}
            nodeOutputConnections[inp.node][inp.output] = nodeOutputConnections[
              inp.node
            ][inp.output] || {
              connections: []
            }
            nodeOutputConnections[inp.node][inp.output].connections.push({
              node: nodeKey,
              input: inputKey
            })
          }
        }
        return nodeOutputConnections
      },
      {}
    )

    // Stage 3: Construct the final object using the output objects
    const reteNodes = {
      id: "demo@0.1.0",
      nodes: Object.keys(pipelineNodes).reduce(
        (reteNodes, nodeKey, nodeIndex) => {
          const node = pipelineNodes[nodeKey]

          const valueMap = {}
          for (const inputKey in node.inputs) {
            const inp = node.inputs[inputKey]
            if (inp.value) {
              valueMap[inputKey] = inp.value
            } else if (inp.param) {
              valueMap[inputKey] = inp
            }
          }

          reteNodes[nodeKey] = {
            id: nodeKey,
            name: node.name,
            data: valueMap,
            inputs: Object.keys(node.inputs).reduce(
              (inputs, inputKey, inputIndex) => {
                const inp = node.inputs[inputKey]
                if (inp.node) {
                  inputs[inputKey] = {
                    connections: [
                      {
                        node: inp.node,
                        output: inp.output
                      }
                    ]
                  }
                }
                return inputs
              },
              {}
            ),
            outputs: nodeOutputConnections[nodeKey] || {},
            position: [nodeIndex * 50, 0]
          }
          return reteNodes
        },
        {}
      )
    }

    return (
      <Diagram
        stages={stages}
        nodes={reteNodes}
        onConnectionCreated={({
          inputNodeId,
          inputKey,
          outputNodeId,
          outputKey
        }) => {
          const newPipeline = cloneDeep(pipeline)
          onChange(
            set(newPipeline, ["nodes", inputNodeId, "inputs", inputKey], {
              node: outputNodeId,
              output: outputKey
            })
          )
        }}
      />
    )
  } catch (e) {
    return <div style={{ color: "#f00" }}>{e.toString()}</div>
  }
}

export default PipelineDiagram
