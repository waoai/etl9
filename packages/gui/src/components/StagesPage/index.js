// @flow

import React, { useEffect, useState } from "react"
import Page from "../Page"
import TextField from "@material-ui/core/TextField"
import { makeStyles } from "@material-ui/styles"
import { useAPI } from "../APIProvider"
import ListSearch from "../ListSearch"
import Button from "@material-ui/core/Button"
import StageEditor from "../StageEditor"
import PipelineDiagram from "../PipelineDiagram"

const useStyles = makeStyles({
  root: { padding: 20 },
  actions: { paddingTop: 20, textAlign: "right" },
  nav: {
    display: "flex",
    paddingBottom: 20
  }
})

export const StagesPage = () => {
  const c = useStyles()
  const api = useAPI()
  const [stages, changeStages] = useState([])
  const { getStages } = useAPI()
  useEffect(() => {
    getStages().then(stages => {
      changeStages(stages)
    })
  })
  const [selectedStage, changeSelectedStage] = useState()
  const [mode, changeMode] = useState("editor")

  return (
    <Page title="Stages">
      {!selectedStage ? (
        <ListSearch
          placeholder="Search for Stage"
          items={stages.map(stage => ({
            stage,
            label: stage.name,
            description: stage.description
          }))}
          onSelect={item => changeSelectedStage(item.stage)}
        />
      ) : (
        <div className={c.root}>
          <div className={c.nav}>
            <Button onClick={() => changeSelectedStage(null)}>
              Back to Search
            </Button>
            <div style={{ flexGrow: 1 }} />
            <Button
              disabled={mode === "editor"}
              onClick={() => changeMode("editor")}
            >
              Editor
            </Button>
            <Button
              disabled={mode === "component"}
              onClick={() => changeMode("component")}
            >
              Component
            </Button>
          </div>
          {mode === "editor" ? (
            <>
              <StageEditor
                stage={selectedStage}
                onChange={changeSelectedStage}
              />
              <div className={c.actions}>
                <Button onClick={async () => {}}>Save</Button>
              </div>
            </>
          ) : mode === "component" ? (
            <div
              style={{ width: "100%", height: 400, border: "1px solid #ccc" }}
            >
              <PipelineDiagram
                stages={[selectedStage]}
                pipeline={{
                  nodes: {
                    stage: {
                      name: selectedStage.name,
                      inputs: {}
                    }
                  }
                }}
              />
            </div>
          ) : null}
        </div>
      )}
    </Page>
  )
}

export default StagesPage
