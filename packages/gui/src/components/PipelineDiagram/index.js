// @flow

import React from "react"
import Diagram from "../Diagram"

type Pipeline = {
  nodes: {
    [nodeName: string]: {
      name: string,
      inputs: {
        [inputKey: string]: { value: any } | { node: string, output: string }
      }
    }
  }
}

export const PipelineDiagram = ({
  stages,
  pipeline
}: {
  stages: Array,
  pipeline: Pipeline
}) => {
  const nodeOutputConnections = Object.keys(pipeline.nodes).reduce(
    (acc, nodeKey) => {
      const node = pipeline.nodes[nodeKey]
      for (const inputKey in node.inputs) {
        const inp = node.inputs[inputKey]
        if (inp.node) {
          acc[inp.node] = acc[inp.node] || {}
          acc[inp.node][inp.output] = acc[inp.node][inp.output] || {
            connections: []
          }
          acc[inp.node][inp.output].connections.push({
            node: nodeKey,
            input: inputKey
          })
        }
      }
      return acc
    },
    {}
  )
  const reteNodes = {
    id: "demo@0.1.0",
    nodes: Object.keys(pipeline.nodes).reduce((acc, nodeKey, nodeIndex) => {
      const node = pipeline.nodes[nodeKey]
      acc[nodeKey] = {
        id: nodeKey,
        name: node.name,
        data: {},
        inputs: Object.keys(node.inputs).reduce((inpAcc, inputKey) => {
          const inp = node.inputs[inputKey]
          if (inp.value) return inpAcc
          inpAcc[inputKey] = {
            connections: [
              {
                node: inp.node,
                output: inp.output
              }
            ]
          }
          return inpAcc
        }, {}),
        outputs: nodeOutputConnections[nodeKey] || {},
        position: [nodeIndex * 50, 0]
      }
      return acc
    }, {})
  }
  return <Diagram stages={stages} nodes={reteNodes} />
}

export default PipelineDiagram
