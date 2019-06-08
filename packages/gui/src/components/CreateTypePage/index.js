// @flow

import React, { useState } from "react"
import { makeStyles } from "@material-ui/styles"
import Page from "../Page"
import Select from "react-select"
import TextField from "@material-ui/core/TextField"
import Button from "@material-ui/core/Button"
import CodeTextArea from "../CodeTextArea"
import TypeEditor from "../TypeEditor"
import { useAPI } from "../APIProvider"
import useNavigation from "../../utils/use-navigation.js"

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
  const [type, changeType] = useState({
    def: {
      kind: "Type",
      name: "",
      superstruct: '"string"'
    }
  })
  const { navigate } = useNavigation()
  const [error, changeError] = useState(null)
  const [requestError, changeRequestError] = useState(null)

  const { createType } = useAPI()

  return (
    <Page title="Create Type">
      <div className={c.root}>
        <TypeEditor type={type} onError={changeError} onChange={changeType} />
        <div style={{ color: "#f00" }}>{requestError}</div>
        <div className={c.actions}>
          <Button
            onClick={async () => {
              changeRequestError(null)
              try {
                await createType(type.def)
              } catch (e) {
                if (e.toString().includes("409")) {
                  changeRequestError("Type with that name already exists")
                } else {
                  changeRequestError(e.toString())
                }
              }
              navigate("/types")
            }}
            disabled={error || type.def.name === ""}
          >
            Create Type "{type.def.name}"
          </Button>
        </div>
      </div>
    </Page>
  )
}

export default CreateTypePage
