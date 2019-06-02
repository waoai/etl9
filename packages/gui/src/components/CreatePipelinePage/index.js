// @flow

import React, { useState } from "react"
import Page from "../Page"
import { makeStyles } from "@material-ui/styles"
import CodeTextArea from "../CodeTextArea"
import Button from "@material-ui/core/Button"
import PipelineEditor from "../PipelineEditor"
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

export const CreatePipelinePage = () => {
  const c = useStyles()

  const { navigate } = useNavigation()
  const { createPipeline } = useAPI()
  const [createError, changeCreateError] = useState(null)
  const [error, changeError] = useState()
  const [pipeline, changePipeline] = useState({
    def: {
      kind: "Pipeline",
      name: "MyPipelineName",
      description: "Some pipeline description",
      nodes: {}
    }
  })

  return (
    <Page title="Create Pipeline">
      <div className={c.root}>
        <PipelineEditor
          pipeline={pipeline}
          onChange={changePipeline}
          onError={changeError}
        />
        <div className={c.actions}>
          <Button
            onClick={async () => {
              changeCreateError(null)
              try {
                await createPipeline(pipeline.def)
                navigate("/pipelines")
              } catch (e) {
                if (e.toString().includes("409")) {
                  changeCreateError("Stage name is already taken")
                } else {
                  changeCreateError(e.toString())
                }
              }
            }}
            disabled={error || pipeline.def.name === null}
          >
            Create Pipeline "{pipeline.def.name ? pipeline.def.name : ""}"
          </Button>
        </div>
      </div>
    </Page>
  )
}

export default CreatePipelinePage
