// @flow

import React, { useState } from "react"
import { makeStyles } from "@material-ui/styles"
import Page from "../Page"
import Select from "react-select"
import TextField from "@material-ui/core/TextField"
import Button from "@material-ui/core/Button"
import { struct } from "superstruct"
import safeEval from "safe-eval"

const useStyles = makeStyles({
  root: {
    display: "flex",
    padding: 20,
    flexDirection: "column",
    "& > *": {
      marginTop: 20
    }
  },
  textArea: {
    fontFamily: "monospace",
    minHeight: 400,
    lineHeight: 1.5
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end"
  }
})

export const CreateTypePage = () => {
  const c = useStyles()
  const [typeName, changeTypeName] = useState("")
  const [typeDef, changeTypeDef] = useState("")

  let error
  try {
    safeEval(`struct(${typeDef})`, { struct })
  } catch (e) {
    error = e.toString()
  }

  return (
    <Page title="Create Type">
      <div className={c.root}>
        <TextField
          placeholder="Type Name"
          onChange={e => changeTypeName(e.target.value)}
          value={typeName}
        />
        <textarea
          onKeyDown={e => {
            if (e.key === "Tab") {
              e.preventDefault()
              const { selectionStart, selectionEnd } = e.target
              changeTypeDef(
                typeDef.substring(0, selectionStart) +
                  "  " +
                  typeDef.substring(selectionStart, selectionEnd)
              )
            }
          }}
          placeholder="Type Definition in superstruct format e.g. { someProperty: 'string' }"
          className={c.textArea}
          style={
            !error
              ? undefined
              : {
                  border: "2px solid #f00"
                }
          }
          onChange={e => changeTypeDef(e.target.value)}
          value={typeDef}
        />
        {error && <div style={{ color: "#f00" }}>{error}</div>}
        <div className={c.actions}>
          <Button disabled={error || typeName === ""}>
            Create Type "{typeName}"
          </Button>
        </div>
      </div>
    </Page>
  )
}

export default CreateTypePage
