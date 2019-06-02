// @flow

import React, { useState, useEffect } from "react"

import yaml from "js-yaml"
import CodeTextArea from "../CodeTextArea"
import { makeStyles } from "@material-ui/styles"
import PipelineDiagram from "../PipelineDiagram"

const useStyles = makeStyles({})

export const PipelineEditor = ({
  pipeline,
  onChange,
  onError,
  showDiagram,
  stages
}: any) => {
  const c = useStyles()
  const [configString, changeConfigString] = useState(() =>
    yaml.safeDump({ kind: "Pipeline", ...pipeline.def })
  )

  let error
  try {
    const doc = yaml.safeLoad(configString)
    if (!doc.kind || doc.kind !== "Pipeline")
      throw new Error('Must have kind of "Pipeline"')
    if (!doc.name) throw new Error("name is required")
  } catch (e) {
    error = e.toString()
  }
  useEffect(
    () => {
      if (onError) onError(error)
    },
    [error]
  )
  useEffect(
    () => {
      if (!error) {
        onChange({
          ...pipeline,
          def: yaml.safeLoad(configString)
        })
      }
    },
    [configString]
  )

  return (
    <div>
      {showDiagram && (
        <div
          style={{
            width: "100%",
            height: 400,
            marginBottom: 20,
            border: "1px solid #ccc"
          }}
        >
          <PipelineDiagram
            stages={stages.map(s => s.def)}
            onChange={newPipeline => {
              changeConfigString(yaml.safeDump(newPipeline))
            }}
            pipeline={pipeline.def}
          />
        </div>
      )}
      <CodeTextArea
        error={error}
        onChange={changeConfigString}
        value={configString}
      />
    </div>
  )
}

export default PipelineEditor
