// @flow

import React, { useState, useEffect } from "react"

import yaml from "js-yaml"
import CodeTextArea from "../CodeTextArea"
import { makeStyles } from "@material-ui/styles"

const useStyles = makeStyles({})

export const StageEditor = ({ stage, onChange, onError }: any) => {
  const c = useStyles()
  const [configString, changeConfigString] = useState(
    yaml.safeDump({ kind: "Stage", ...stage })
  )

  let error, stageName
  try {
    const doc = yaml.safeLoad(configString)
    stageName = doc.name
    if (!doc.kind || doc.kind !== "Stage")
      throw new Error('Must have kind of "Stage"')
    if (!doc.name) throw new Error("name is required")
    if (!stageName.match(/[A-Z][a-zA-Z]+/))
      throw new Error("Stage names should be CapitalCase")
  } catch (e) {
    error = e.toString()
  }
  useEffect(
    () => {
      if (onError) onError(error)
    },
    [error]
  )

  return (
    <CodeTextArea
      error={error}
      onChange={changeConfigString}
      value={configString}
    />
  )
}

export default StageEditor
