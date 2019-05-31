// @flow

import React, { useState, useEffect } from "react"
import Page from "../Page"
import ListSearch from "../ListSearch"
import { makeStyles } from "@material-ui/styles"
import { useAPI } from "../APIProvider"
import Button from "@material-ui/core/Button"
import WaterTable from "react-watertable"

const useStyles = makeStyles({
  root: { padding: 20 },
  actions: { paddingTop: 20, textAlign: "right" },
  nav: {
    display: "flex",
    paddingBottom: 20
  }
})

export const LaunchInstancePage = () => {
  const c = useStyles()
  const { getPipelines, getStages } = useAPI()
  const [pipelines, changePipelines] = useState([])
  const [stages, changeStages] = useState([])
  const [configVars, changeConfigVars] = useState([])
  const [selectedPipeline, changeSelectedPipeline] = useState()
  useEffect(() => {
    getPipelines().then(pipelines => {
      changePipelines(pipelines)
    })
    getStages().then(stages => {
      changeStages(stages)
    })
  }, [])
  useEffect(
    () => {
      if (!selectedPipeline) return
      const configVars = []
      for (const nodeKey in selectedPipeline.nodes) {
        const node = selectedPipeline.nodes[nodeKey]
        if (!node.inputs) continue
        for (const inputKey in node.inputs) {
          const input = node.inputs[inputKey]
          if (input.key) {
            configVars.push({
              key: input.key,
              type: "string",
              value: ""
            })
          }
        }
      }
      changeConfigVars(configVars)
    },
    [selectedPipeline]
  )
  return (
    <Page title="Launch Instance">
      {!selectedPipeline ? (
        <ListSearch
          placeholder="Search for Pipeline"
          items={pipelines
            .map(pipeline => ({
              pipeline,
              label: pipeline.name,
              description: pipeline.description
            }))
            .concat(
              stages.map(stage => ({
                pipeline: stage, // TODO create standalone pipeline stage
                label: `Standalone ${stage.name}`,
                description: stage.description
              }))
            )}
          onSelect={item => changeSelectedPipeline(item.pipeline)}
        />
      ) : (
        <div className={c.root}>
          <div className={c.nav}>
            <Button onClick={() => changeSelectedPipeline(null)}>
              Back to Search
            </Button>
            <div style={{ flexGrow: 1 }} />
          </div>
          <div>
            {configVars && configVars.length > 0 && (
              <WaterTable
                canAddMore={false}
                canDelete={false}
                tableName="Instance Configuration"
                schema={{
                  key: {
                    title: "Key",
                    type: "text",
                    editable: false
                  },
                  type: {
                    title: "Type",
                    type: "text",
                    editable: false
                  },
                  value: {
                    title: "Value",
                    type: "text"
                  }
                }}
                data={configVars}
              />
            )}
          </div>
          <div className={c.actions}>
            <Button>Launch</Button>
          </div>
        </div>
      )}
    </Page>
  )
}

export default LaunchInstancePage
