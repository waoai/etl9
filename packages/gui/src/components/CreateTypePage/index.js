// @flow

import React, { useState } from "react"
import { makeStyles } from "@material-ui/styles"
import Page from "../Page"
import Select from "react-select"
import TextField from "@material-ui/core/TextField"
import Button from "@material-ui/core/Button"
import { struct } from "superstruct"
import safeEval from "safe-eval"
import CodeTextArea from "../CodeTextArea"

const useStyles = makeStyles({
  root: {
    display: "flex",
    padding: 20,
    flexDirection: "column",
    "& > *": {
      marginTop: 20
    }
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
    if (!typeName.match(/[A-Z][a-zA-Z]+/))
      throw new Error("Type names should be CapitalCase")

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
        <CodeTextArea onChange={changeTypeDef} value={typeDef} error={error} />
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
