// @flow

import React, { useState } from "react"
import Page from "../Page"
import { makeStyles } from "@material-ui/styles"
import CodeTextArea from "../CodeTextArea"
import Button from "@material-ui/core/Button"
import StageEditor from "../StageEditor"
import { useAPI } from "../APIProvider"
import useNavigation from "../../utils/use-navigation.js"

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

  const { createStage } = useAPI()
  const { navigate } = useNavigation()

  const [createError, changeCreateError] = useState(null)
  const [error, changeError] = useState()
  const [stage, changeStage] = useState({
    def: {
      kind: "Stage",
      name: "MyStageName",
      description: "Some stage description",
      inputs: { some_input: { type: "string" } },
      outputs: { some_input: { type: "string" } }
    }
  })

  return (
    <Page title="Create Stage">
      <div className={c.root}>
        <StageEditor
          stage={stage}
          onChange={changeStage}
          onError={changeError}
        />
        <div style={{ color: "#f00" }}>{createError}</div>
        <div className={c.actions}>
          <Button
            onClick={async () => {
              changeCreateError(null)
              try {
                await createStage(stage.def)
                navigate("/stages")
              } catch (e) {
                if (e.toString().includes("409")) {
                  changeCreateError("Stage name is already taken")
                } else {
                  changeCreateError(e.toString())
                }
              }
            }}
            disabled={error || stage.def.name === null}
          >
            Create Stage "{stage.def.name ? stage.def.name : ""}"
          </Button>
        </div>
      </div>
    </Page>
  )
}

export default CreateStagePage
