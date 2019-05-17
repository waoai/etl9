// @flow

import React, { useEffect } from "react"
import { makeStyles } from "@material-ui/styles"
import CodeTextArea from "../CodeTextArea"
import safeEval from "safe-eval"
import TextField from "@material-ui/core/TextField"
import { struct } from "superstruct"

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    "& > *": {
      marginTop: 20
    },
    "&:first-child": { marginTop: 0 }
  }
})

export const TypeEditor = ({ type = {}, onChange, onError }) => {
  const c = useStyles()

  let error
  try {
    if (!type.name.match(/[A-Z][a-zA-Z]+/))
      throw new Error("Type names should be CapitalCase")

    safeEval(`struct(${type.superstruct})`, { struct })
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
    <div className={c.root}>
      <TextField
        placeholder="Type Name"
        onChange={e => onChange({ ...type, name: e.target.value })}
        value={type.name || ""}
      />
      <CodeTextArea
        onChange={v => onChange({ ...type, superstruct: v })}
        value={type.superstruct || ""}
        error={error}
      />
    </div>
  )
}

export default TypeEditor
