// @flow

import React, { useState, useEffect } from "react"
import Page from "../Page"
import { makeStyles } from "@material-ui/styles"
import useNavigation from "../../utils/use-navigation.js"
import { useAPI } from "../APIProvider"
import WaterTable from "react-watertable"

const useStyles = makeStyles({
  root: {
    padding: 20
  }
})

export default () => {
  const c = useStyles()
  const { navigate } = useNavigation()
  const { getInstances } = useAPI()

  const [instances, changeInstances] = useState()
  useEffect(() => {
    getInstances().then(changeInstances)
  }, [])

  return (
    <Page title="Instances">
      <div className={c.root}>
        {instances && instances.length > 0 ? (
          <WaterTable
            canDelete={false}
            canAddMore={false}
            tableName="Instances"
            data={instances}
            recordActions={["View"]}
            onClickRecordAction={(instance, action) => {
              if (action === "View") {
                navigate(`/instance/${instance.id}`)
              }
            }}
          />
        ) : (
          <div className={c.empty}>No Instances</div>
        )}
      </div>
    </Page>
  )
}
