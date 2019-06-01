// @flow

import React, { useState, useEffect, useMemo } from "react"
import moment from "moment"
import Page from "../Page"
import { useAPI } from "../APIProvider"
import { useNavigation } from "../../utils/use-navigation.js"
import { makeStyles } from "@material-ui/styles"
import PipelineDiagram from "../PipelineDiagram"
import Button from "@material-ui/core/Button"
import TimeSince from "../TimeSince"
import { grey, green, red, blue } from "@material-ui/core/colors"
import WaterTable from "react-watertable"
import StageInstance from "./StageInstance.js"

const useStyles = makeStyles({
  header: {
    fontWeight: "bold",
    display: "flex",
    fontSize: 18,
    padding: 10
  },
  progress: {
    flexGrow: 1,
    color: grey[600]
  },
  headerActions: {},
  overviewTable: {
    padding: 10
  },
  stageInstances: {}
})

export const InstancePage = () => {
  const c = useStyles()
  const { getURLParams } = useNavigation()
  const { getPipelineInstances, getStages } = useAPI()

  const instanceId = useMemo(() => {
    const { path } = getURLParams()
    return path[1]
  }, [])

  const [instance, changeInstance] = useState()
  const [stageInstances, changeStageInstances] = useState()
  const [stageDefinitions, changeStageDefinitions] = useState()

  useEffect(
    () => {
      if (!instanceId) return
      getStages().then(stages => {
        changeStageDefinitions(stages)
      })
      getPipelineInstances({ id: instanceId }).then(instances => {
        const instance = instances[0]
        changeStageInstances(
          Object.keys(instance.stageStates)
            .map(stageInstanceId => ({
              stageInstanceId,
              ...instance.stageStates[stageInstanceId]
            }))
            .map(si => {
              const inputDef =
                instance.pipelineDefinition.nodes[si.stageInstanceId].inputs
              const input = {}
              for (const k in inputDef) {
                if (inputDef[k].value) {
                  input[k] = inputDef[k].value
                } else if (inputDef[k].node) {
                  input[k] = ((instance.stageStates[inputDef[k].node] || {})
                    .output || {})[inputDef[k].value]
                }
              }
              return {
                ...si,
                input,
                status: si.complete
                  ? "complete"
                  : si.error
                  ? "error"
                  : si.progress > 0
                  ? "running"
                  : "not-started"
              }
            })
        )
        changeInstance(instance)
      })
    },
    [instanceId]
  )

  return (
    <Page title={`Pipeline Instance "${instanceId}"`}>
      {!instance ? (
        <div>loading</div>
      ) : (
        <>
          <div className={c.header}>
            <div className={c.progress}>
              <span style={{ paddingRight: 10 }}>
                Progress: {Math.floor(instance.progress * 100)}%
              </span>{" "}
              Runtime: <TimeSince sinceTime={instance.createdAt} />
            </div>
            <div className={c.headerActions}>
              <Button disabled>Migrate</Button>
              <Button disabled>Reset</Button>
              <Button disabled>Delete</Button>
            </div>
          </div>
          <div style={{ height: 400 }}>
            <PipelineDiagram
              stages={stageDefinitions}
              pipeline={instance.pipelineDefinition}
            />
          </div>
          <div className={c.overviewTable}>
            <WaterTable
              tableName="Stage Instances Overview"
              schema={{
                stageInstanceId: {
                  title: "Stage Instance Id",
                  type: "text",
                  readOnly: true
                },
                progress: {
                  title: "Progress",
                  type: "text",
                  readOnly: true
                },
                status: {
                  title: "Status",
                  type: "select",
                  readOnly: true,
                  options: [
                    { value: "complete", label: "Complete", color: green[500] },
                    { value: "error", label: "Error", color: red[500] },
                    { value: "running", label: "Running", color: green[500] },
                    {
                      value: "not-started",
                      label: "Not Started"
                    }
                  ]
                },
                error: { title: "Error", type: "json" },
                input: { title: "Input", type: "json" },
                output: { title: "Output", type: "json" },
                state: { title: "State", type: "json" }
              }}
              data={stageInstances || []}
              canDelete={false}
              canAddMore={false}
            />
          </div>
          <div className={c.stageInstances}>
            {(stageInstances || []).map(si => (
              <StageInstance key={si.stageInstanceId} {...si} />
            ))}
          </div>
        </>
      )}
    </Page>
  )
}

export default InstancePage
