// @flow

import React, { useState, useEffect } from "react"
import Page from "../Page"
import ListSearch from "../ListSearch"
import { makeStyles } from "@material-ui/styles"
import { useAPI } from "../APIProvider"
import Button from "@material-ui/core/Button"
import WaterTable from "react-watertable"
import useNavigation from "../../utils/use-navigation.js"

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
  const { navigate, getURLQuery } = useNavigation()
  const { getPipelines, getStages, createInstance } = useAPI()
  const [pipelines, changePipelines] = useState([])
  const [stages, changeStages] = useState([])
  const [configVars, changeConfigVars] = useState([])
  const [selectedPipeline, changeSelectedPipeline] = useState()
  useEffect(() => {
    getPipelines().then(pipelines => {
      changePipelines(pipelines)
      const qs = getURLQuery()
      if (qs["pipeline_parent"] && !selectedPipeline) {
        changeSelectedPipeline(
          pipelines.find(p => p.entity_id === qs["pipeline_parent"])
        )
      }
    })
    getStages().then(stages => {
      changeStages(stages)
    })
  }, [])
  useEffect(
    () => {
      if (!selectedPipeline) return
      const configVars = []
      for (const nodeKey in selectedPipeline.def.nodes) {
        const node = selectedPipeline.def.nodes[nodeKey]
        if (!node.inputs) continue
        for (const inputKey in node.inputs) {
          const input = node.inputs[inputKey]
          if (input.param && !input.param.startsWith("$")) {
            configVars.push({
              param: input.param,
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
              label: pipeline.def.name,
              description: pipeline.def.description
            }))
            .concat(
              stages.map(stage => ({
                pipeline: {
                  name: `Standalone ${stage.def.name}`,
                  description: stage.def.description,
                  def: {
                    nodes: {
                      stage: {
                        name: stage.def.name,
                        inputs: Object.keys(stage.def.inputs).reduce(
                          (acc, ik) => {
                            acc[ik] = { param: ik }
                            return acc
                          },
                          {}
                        )
                      }
                    }
                  }
                },
                label: `Standalone ${stage.def.name}`,
                description: stage.def.description
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
            {configVars &&
              configVars.length > 0 && (
                <WaterTable
                  canAddMore={false}
                  canDelete={false}
                  tableName="Instance Configuration"
                  schema={{
                    param: {
                      title: "Param",
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
                  onChangeData={newData => changeConfigVars(newData)}
                />
              )}
          </div>
          <div className={c.actions}>
            <Button
              onClick={async () => {
                const config = configVars.reduce((acc, { param, value }) => {
                  // TODO type checking
                  acc[param] = value
                  return acc
                }, {})

                const instance = await createInstance({
                  def: selectedPipeline.def,
                  params: config
                })

                navigate(`/instance/${instance.id}`)
              }}
            >
              Launch Instance
            </Button>
          </div>
        </div>
      )}
    </Page>
  )
}

export default LaunchInstancePage
