// @flow

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react"
import Rete from "rete"
import ReactRenderPlugin from "rete-react-render-plugin"
import ConnectionPlugin from "rete-connection-plugin"
import ContextMenuPlugin from "rete-context-menu-plugin"
import AreaPlugin from "rete-area-plugin"
import AutoArrangePlugin from "rete-auto-arrange-plugin"
import MyControl from "./MyControl.js"
import MyNode from "./MyNode.js"

const numSocket = new Rete.Socket("Number value")
class StageComponent extends Rete.Component {
  constructor(stage) {
    super(stage.name)
    this.stage = stage
  }

  builder(node) {
    for (const inputKey in this.stage.inputs) {
      const inp = this.stage.inputs[inputKey]
      node.addInput(
        new Rete.Input(inputKey, `${inputKey}[${inp.type}]`, numSocket, false)
      )
    }
    for (const outputKey in this.stage.outputs) {
      const out = this.stage.outputs[outputKey]
      node.addOutput(
        new Rete.Output(outputKey, `${outputKey}[${out.type}]`, numSocket)
      )
    }

    return node
  }
  worker(node, inputs, outputs) {}
}

export const Diagram = ({ nodes, stages }: any) => {
  const containerMountRef = useCallback(container => {
    if (!container) return

    const editor = new Rete.NodeEditor("demo@0.1.0", container)
    const components = stages.map(s => new StageComponent(s))
    components.forEach(c => editor.register(c))

    editor.use(ConnectionPlugin)
    editor.use(ReactRenderPlugin)
    editor.use(ContextMenuPlugin)
    editor.use(AutoArrangePlugin, { margin: { x: 50, y: 50 }, depth: 0 })

    editor.fromJSON(nodes)
    editor.view.resize()

    setTimeout(() => {
      editor.view.resize()
      editor.trigger("arrange", {})
      AreaPlugin.zoomAt(editor)
    }, 100)
  }, [])

  return (
    <div style={{ textAlign: "left", width: "100%", height: "100%" }}>
      <div ref={containerMountRef} />
    </div>
  )
}

export default Diagram
