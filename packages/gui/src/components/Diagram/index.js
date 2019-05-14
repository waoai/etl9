// @flow

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react"
import Rete from "rete"
import ReactRenderPlugin from "rete-react-render-plugin"
import ConnectionPlugin from "rete-connection-plugin"
// import ContextMenuPlugin from "rete-context-menu-plugin";
import AreaPlugin from "rete-area-plugin"
import MyControl from "./MyControl.js"
import MyNode from "./MyNode.js"

const numSocket = new Rete.Socket("Number value")
class AddComponent extends Rete.Component {
  constructor() {
    super("Add")
  }

  builder(node) {
    var inp = new Rete.Input("num1", "Number", numSocket)
    var out = new Rete.Output("num", "Number", numSocket)
    var ctrl = new MyControl(this.editor, "greeting", "#username")

    return node
      .addInput(inp)
      .addOutput(out)
      .addControl(ctrl)
  }

  worker(node, inputs, outputs) {
    console.log(node.data.greeting)
  }
}

export const Diagram = () => {
  const containerMountRef = useCallback(container => {
    if (!container) return

    const editor = new Rete.NodeEditor("demo@0.1.0", container)
    const components = [new AddComponent()]
    components.forEach(c => editor.register(c))

    editor.use(ConnectionPlugin)
    editor.use(ReactRenderPlugin)
    editor.fromJSON({
      id: "demo@0.1.0",
      nodes: {
        "1": {
          id: 1,
          data: {},
          inputs: { num1: { connections: [] } },
          outputs: {
            num: { connections: [{ node: 2, input: "num1", data: {} }] }
          },
          position: [-285.5, -105.375],
          name: "Add"
        },
        "2": {
          id: 2,
          data: {},
          inputs: {
            num1: { connections: [{ node: 1, output: "num", data: {} }] }
          },
          outputs: { num: { connections: [] } },
          position: [-16.5, -99.375],
          name: "Add"
        }
      }
    })

    editor.view.resize()
    AreaPlugin.zoomAt(editor)
  }, [])

  return (
    <div style={{ textAlign: "left", width: "100vw", height: "70vh" }}>
      <div ref={containerMountRef} />
    </div>
  )
}

export default Diagram
