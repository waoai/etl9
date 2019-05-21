// @flow

import React from "react"
import Diagram from "../Diagram"
import cloneDeep from "lodash/cloneDeep"

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
  try {
    // Try to construct the rete node structure from the Pipeline format

    // Stage 1: Create nodes representing any "value" pipeline connections
    const pipelineNodes = cloneDeep(pipeline.nodes)
    // for (const nodeKey in pipeline.nodes) {
    //   const node = pipeline.nodes[nodeKey]
    //   for (const inputKey in node.inputs) {
    //     const input = node.inputs[inputKey]
    //     if (input.value) {
    //       const nodeId = `${nodeKey}_${inputKey}`
    //       pipelineNodes[nodeId] = {
    //         name: "Value",
    //         inputs: {}
    //       }
    //       pipelineNodes[nodeKey].inputs[inputKey] = {
    //         node: nodeId,
    //         output: "output"
    //       }
    //     }
    //   }
    // }

    // Stage 2: Create the output connections
    const nodeOutputConnections = Object.keys(pipelineNodes).reduce(
      (nodeOutputConnections, nodeKey) => {
        const node = pipelineNodes[nodeKey]
        for (const inputKey in node.inputs) {
          const inp: { value: any } | { output: string, node: string } =
            node.inputs[inputKey]
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
          } else if (inp.value) {
            // const vKey = `${nodeKey}_${inputKey}`
            // nodeOutputConnections[vKey] = nodeOutputConnections[vKey] || {}
            // nodeOutputConnections[vKey].output = {
            //   connections: [
            //     {
            //       node: nodeKey,
            //       input: inputKey
            //     }
            //   ]
            // }
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

    return <Diagram stages={stages} nodes={reteNodes} />
  } catch (e) {
    return <div style={{ color: "#f00" }}>{e.toString()}</div>
  }
}

export default PipelineDiagram
