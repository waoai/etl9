// @flow

import React, { useState, useEffect } from "react"
import Page from "../Page"
import { makeStyles } from "@material-ui/styles"
import WaterTable from "react-watertable"
import { useAPI } from "../APIProvider"
import useNavigation from "../../utils/use-navigation.js"

const useStyles = makeStyles({
  root: {
    padding: 20
  },
  statusBlocks: {
    display: "flex",
    flexWrap: "wrap"
  },
  statusBlock: {
    margin: 20,
    padding: 20,
    backgroundColor: "#000",
    "& .title": {
      color: "#fff",
      fontSize: 12,
      fontWeight: "bold",
      textTransform: "uppercase"
    },
    "& .value": {
      color: "#fff",
      fontSize: 28
    }
  }
})

export const DashboardPage = () => {
  const c = useStyles()
  const { navigate } = useNavigation()
  const { getInstances } = useAPI()

  const [instances, changeInstances] = useState()
  useEffect(() => {
    getInstances({ minimal: true }).then(changeInstances)
  }, [])

  const statusBlocks = [
    // { title: "Calls/Min", value: 103 },
    { title: "Active Instances", value: instances ? instances.length : "..." }
  ]

  return (
    <Page title="Dashboard">
      <div className={c.root}>
        <div className={c.statusBlocks}>
          {statusBlocks.map(sb => (
            <div className={c.statusBlock}>
              <div className="title">{sb.title}</div>
              <div className="value">{sb.value}</div>
            </div>
          ))}
        </div>
        <div className={c.instances}>
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
      </div>
    </Page>
  )
}

export default DashboardPage
