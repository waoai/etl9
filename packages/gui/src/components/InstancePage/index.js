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
import { grey, green, red, blue, yellow } from "@material-ui/core/colors"
import WaterTable from "react-watertable"
import WaterObject from "react-watertable/components/Waterobject"
import StageInstance from "./StageInstance.js"
import AreYouSureButton from "../AreYouSureButton"

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
  stageInstances: {},
  notFound: { fontSize: 32, padding: 50, textAlign: "center" },
  parameterTable: {
    padding: 10
  }
})

export const InstancePage = () => {
  const c = useStyles()
  const { getURLParams, navigate } = useNavigation()
  const {
    getInstances,
    deleteInstance,
    modifyInstance,
    resetInstance,
    getStages
  } = useAPI()

  const instanceId = useMemo(() => {
    const { path } = getURLParams()
    return path[1]
  }, [])

  const [notFound, changeNotFound] = useState(false)
  const [instance, changeInstance] = useState()
  const [refreshKey, changeRefreshKey] = useState()
  const [stageInstances, changeStageInstances] = useState()
  const [stageDefinitions, changeStageDefinitions] = useState()

  const instanceState = instance ? instance.instance_state || {} : {}

  useEffect(() => {
    if (!instanceId) return
    getStages().then(stages => {
      changeStageDefinitions(stages)
    })
    getInstances({ id: instanceId }).then(instances => {
      if (instances.length === 0) return changeNotFound(true)
      const instance = instances[0]
      const { stageInstances = [] } = instance.instance_state || {}
      changeStageInstances(
        Object.keys(stageInstances)
          .map(stageInstanceId => ({
            stageInstanceId,
            ...stageInstances[stageInstanceId]
          }))
          .map(si => {
            const inputDef =
              instance.pipeline_def.nodes[si.stageInstanceId].inputs
            const input = {}
            for (const k in inputDef) {
              if (inputDef[k].value) {
                input[k] = inputDef[k].value
              } else if (inputDef[k].node) {
                input[k] = ((stageInstances[inputDef[k].node] || {}).output ||
                  {})[inputDef[k].value]
              }
            }
            return {
              ...si,
              input,
              status: si.complete
                ? "complete"
                : si.error
                ? si.error.summary && si.error.summary.includes("Waiting on")
                  ? "waiting"
                  : "error"
                : si.callCount > 0
                ? "running"
                : "not-started"
            }
          })
      )
      changeInstance(instance)
    })
  }, [instanceId, refreshKey])

  if (notFound) {
    return (
      <Page title={`Pipeline Instance "${instanceId}"`}>
        <div className={c.notFound}>Not Found</div>
      </Page>
    )
  }

  return (
    <Page title={`Pipeline Instance "${instanceId}"`}>
      {!instance ? (
        <div>loading</div>
      ) : (
        <>
          <div className={c.header}>
            <div className={c.progress}>
              <span style={{ paddingRight: 10 }}>
                Progress:{" "}
                {instanceState.progress
                  ? `${Math.floor(instanceState.progress * 100)}%`
                  : "Not Started"}
              </span>{" "}
              Runtime: <TimeSince sinceTime={instance.created_at} />
            </div>
            <div className={c.headerActions}>
              {/* <Button onClick={() => changeParamDialogOpen(true)}>
                View Params
              </Button> */}
              <Button
                onClick={async () => {
                  await modifyInstance({
                    instance_id: instanceId,
                    instance_state: {
                      ...instanceState,
                      paused: !instanceState.paused
                    }
                  })
                  changeRefreshKey(Date.now())
                }}
              >
                {instanceState.paused ? "Unpause" : "Pause"}
              </Button>
              <Button onClick={() => changeRefreshKey(Date.now())}>
                Refresh
              </Button>
              <AreYouSureButton
                onClick={async () => {
                  await resetInstance(instance.id)
                  changeRefreshKey(Date.now())
                }}
              >
                Reset
              </AreYouSureButton>
              <AreYouSureButton
                onClick={async () => {
                  await deleteInstance(instance.id)
                  navigate("/instances")
                }}
              >
                Delete
              </AreYouSureButton>
            </div>
          </div>
          <div style={{ height: 400, backgroundColor: "#f8f8f8" }}>
            {stageDefinitions && instance && (
              <PipelineDiagram
                stages={(stageDefinitions || []).map(s => s.def)}
                pipeline={instance.pipeline_def}
              />
            )}
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
                    { value: "waiting", label: "Waiting", color: yellow[500] },
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
          <div className={c.parameterTable}>
            <WaterObject
              tableName="Params"
              canAddMore={false}
              data={instance.params}
            />
          </div>
          <div className={c.stageInstances}>
            {(stageInstances || []).map(si => (
              <StageInstance
                key={si.stageInstanceId}
                instanceId={instanceId}
                {...si}
              />
            ))}
          </div>
        </>
      )}
    </Page>
  )
}

export default InstancePage
