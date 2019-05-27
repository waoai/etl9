// @flow

import React, { useState, useEffect } from "react"
import { useAPI } from "../APIProvider"
import { makeStyles } from "@material-ui/styles"
import WaterTable from "react-watertable"
import useNavigation from "../../utils/use-navigation.js"

const useStyles = makeStyles({})

export const PipelineInstances = ({ pipelineName }) => {
  const c = useStyles()
  const { navigate } = useNavigation()
  const { getPipelineInstances, deletePipelineInstance } = useAPI()
  const [instances, changeInstances] = useState()
  useEffect(() => {
    getPipelineInstances(pipelineName).then(instances => {
      changeInstances(instances)
    })
  }, [])

  return (
    <div>
      {instances ? (
        instances.length === 0 ? (
          <div>no instances created yet</div>
        ) : (
          <WaterTable
            tableName="Pipeline Instances"
            recordActions={["View"]}
            data={instances}
            onDeleteRow={instance => deletePipelineInstance(instance)}
            onClickRecordAction={(row, action) => {
              if (action === "View") {
                navigate(`/pipeline-instances/${row.id}`)
              }
            }}
          />
        )
      ) : (
        <div>loading</div>
      )}
    </div>
  )
}

export default PipelineInstances
