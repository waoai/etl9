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

export const LaunchPipelinePage = () => {
  const c = useStyles()
  const { getPipelines } = useAPI()
  const [pipelines, changePipelines] = useState([])
  const [configVars, changeConfigVars] = useState([])
  const [selectedPipeline, changeSelectedPipeline] = useState()
  useEffect(() => {
    getPipelines().then(pipelines => {
      changePipelines(pipelines)
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
    <Page title="Launch Pipeline">
      {!selectedPipeline ? (
        <ListSearch
          placeholder="Search for Pipeline"
          items={pipelines.map(pipelines => ({
            pipelines,
            label: pipelines.name,
            description: pipelines.description
          }))}
          onSelect={item => changeSelectedPipeline(item.pipelines)}
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
            {configVars &&
              configVars.length > 0 && (
                <WaterTable
                  canAddMore={false}
                  canDelete={false}
                  tableName="Instance Configuration"
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

export default LaunchPipelinePage
