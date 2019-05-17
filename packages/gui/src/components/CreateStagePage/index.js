// @flow

import React, { useState } from "react"
import Page from "../Page"
import { makeStyles } from "@material-ui/styles"
import CodeTextArea from "../CodeTextArea"
import Button from "@material-ui/core/Button"
import StageEditor from "../StageEditor"

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    padding: 20
  },
  actions: {
    marginTop: 10,
    display: "flex",
    justifyContent: "flex-end"
  }
})

export const CreateStagePage = () => {
  const c = useStyles()

  const [error, changeError] = useState()
  const [stage, changeStage] = useState({
    kind: "Stage",
    name: "MyStageName",
    description: "Some stage description",
    inputs: { some_input: { type: "string" } },
    outputs: { some_input: { type: "string" } }
  })

  return (
    <Page title="Create Stage">
      <div className={c.root}>
        <StageEditor
          stage={stage}
          onChange={changeStage}
          onError={changeError}
        />
        <div className={c.actions}>
          <Button disabled={error || stage.name === null}>
            Create Stage "{stage.name ? stage.name : ""}"
          </Button>
        </div>
      </div>
    </Page>
  )
}

export default CreateStagePage
