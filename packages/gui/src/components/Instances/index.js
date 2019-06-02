// @flow

import React, { useState, useEffect } from "react"
import { useAPI } from "../APIProvider"
import { makeStyles } from "@material-ui/styles"
import WaterTable from "react-watertable"
import useNavigation from "../../utils/use-navigation.js"

const useStyles = makeStyles({})

export const Instances = ({ pipeline }) => {
  const c = useStyles()
  const { navigate } = useNavigation()
  const { getInstances, deleteInstance } = useAPI()
  const [instances, changeInstances] = useState()
  useEffect(() => {
    getInstances({ pipeline_parent: pipeline.entity_id }).then(instances => {
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
            canAddMore={false}
            tableName="Instances"
            recordActions={["View"]}
            data={instances}
            onDeleteRow={instance => deleteInstance(instance.id)}
            onClickRecordAction={(row, action) => {
              if (action === "View") {
                navigate(`/instance/${row.id}`)
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

export default Instances
