// @flow

import React, { useState } from "react"
import { makeStyles } from "@material-ui/styles"
import Page from "../Page"
import Select from "react-select"
import TextField from "@material-ui/core/TextField"
import Button from "@material-ui/core/Button"
import CodeTextArea from "../CodeTextArea"
import TypeEditor from "../TypeEditor"

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
  const [type, changeType] = useState({})

  return (
    <Page title="Create Type">
      <div className={c.root}>
        <TypeEditor type={type} onChange={changeType} />
        <div className={c.actions}>
          <Button disabled={type.error || type.name === ""}>
            Create Type "{type.name}"
          </Button>
        </div>
      </div>
    </Page>
  )
}

export default CreateTypePage
