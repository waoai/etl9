// @flow

import React, { useEffect, useState } from "react"
import Page from "../Page"
import TextField from "@material-ui/core/TextField"
import { makeStyles } from "@material-ui/styles"
import { useAPI } from "../APIProvider"
import ListSearch from "../ListSearch"
import Button from "@material-ui/core/Button"
import PipelineDiagram from "../PipelineDiagram"
import PipelineEditor from "../PipelineEditor"
import Instances from "../Instances"
import useNavigation from "../../utils/use-navigation.js"

const useStyles = makeStyles({
  root: { padding: 20 },
  actions: { paddingTop: 20, textAlign: "right" },
  nav: {
    display: "flex",
    paddingBottom: 20
  }
})

export const PipelinesPage = () => {
  const c = useStyles()
  const api = useAPI()
  const { navigate } = useNavigation()
  const [pipelines, changePipelines] = useState([])
  const [stages, changeStages] = useState([])
  const { getPipelines, getStages } = useAPI()
  const [mode, changeMode] = useState("editor")
  useEffect(() => {
    getPipelines().then(pipelines => {
      changePipelines(pipelines)
    })
    getStages().then(stages => {
      changeStages(stages)
    })
  }, [])
  const [selectedPipeline, changeSelectedPipeline] = useState()

  return (
    <Page title="Pipelines">
      {!selectedPipeline ? (
        <ListSearch
          placeholder="Search for Pipeline"
          items={pipelines.map(pipeline => ({
            pipeline,
            label: pipeline.def.name,
            description: pipeline.def.description
          }))}
          onSelect={item => changeSelectedPipeline(item.pipeline)}
        />
      ) : (
        <div className={c.root}>
          <div className={c.nav}>
            <Button onClick={() => changeSelectedPipeline(null)}>
              Back to Search
            </Button>
            <div style={{ flexGrow: 1 }} />
            <Button onClick={() => changeMode("editor")}>Editor</Button>
            <Button onClick={() => changeMode("instances")}>Instances</Button>
          </div>
          {mode === "editor" ? (
            <>
              <div
                style={{ width: "100%", height: 400, border: "1px solid #ccc" }}
              >
                <PipelineDiagram
                  stages={stages.map(s => s.def)}
                  pipeline={selectedPipeline.def}
                />
              </div>
              <div style={{ marginTop: 20 }}>
                <PipelineEditor
                  pipeline={selectedPipeline}
                  onChange={changeSelectedPipeline}
                />
              </div>
            </>
          ) : mode === "instances" ? (
            <>
              <Instances pipeline={selectedPipeline} />
            </>
          ) : null}
          <div className={c.actions}>
            <Button
              onClick={async () => {
                await api.deletePipeline(selectedPipeline.entity_id)
                navigate("/pipelines")
              }}
            >
              Delete
            </Button>
            <Button
              onClick={async () => {
                navigate(
                  `/launch-instance?pipeline_parent=${
                    selectedPipeline.entity_id
                  }`
                )
              }}
            >
              Launch Instance
            </Button>
            <Button
              onClick={async () => {
                await api.modifyPipeline(selectedPipeline)
              }}
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </Page>
  )
}

export default PipelinesPage
