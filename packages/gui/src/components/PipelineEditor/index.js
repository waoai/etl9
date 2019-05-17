// @flow

import React, { useState, useEffect } from "react"

import yaml from "js-yaml"
import CodeTextArea from "../CodeTextArea"
import { makeStyles } from "@material-ui/styles"

const useStyles = makeStyles({})

export const PipelineEditor = ({ pipeline, onChange, onError }: any) => {
  const c = useStyles()
  const [configString, changeConfigString] = useState(
    yaml.safeDump({ kind: "Pipeline", ...pipeline })
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
        onChange(yaml.safeLoad(configString))
      }
    },
    [configString]
  )

  return (
    <CodeTextArea
      error={error}
      onChange={changeConfigString}
      value={configString}
    />
  )
}

export default PipelineEditor
