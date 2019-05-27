// @flow

import React, { useState } from "react"
import Page from "../Page"
import { makeStyles } from "@material-ui/styles"
import CodeTextArea from "../CodeTextArea"
import Button from "@material-ui/core/Button"
import PipelineEditor from "../PipelineEditor"

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

  const [error, changeError] = useState()
  const [pipeline, changePipeline] = useState({
    kind: "Pipeline",
    name: "MyPipelineName",
    description: "Some pipeline description",
    nodes: {}
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
          <Button disabled={error || pipeline.name === null}>
            Create Pipeline "{pipeline.name ? pipeline.name : ""}"
          </Button>
        </div>
      </div>
    </Page>
  )
}

export default CreatePipelinePage
