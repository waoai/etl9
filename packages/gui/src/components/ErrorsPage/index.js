// @flow

import React, { useState, useEffect } from "react"
import Page from "../Page"
import { makeStyles } from "@material-ui/styles"
import WaterTable from "react-watertable"
import { useAPI } from "../APIProvider"

const useStyles = makeStyles({
  root: { padding: 10 }
})

export default () => {
  const c = useStyles()
  const { getLogs } = useAPI()
  const [logs, changeLogs] = useState(null)
  useEffect(() => {
    getLogs().then(changeLogs)
  }, [])

  return (
    <Page title="Errors & Warnings">
      <div className={c.root}>
        {logs === null ? (
          "Loading"
        ) : logs.length === 0 ? (
          "No Logs"
        ) : (
          <WaterTable
            canDelete={false}
            canAddMore={false}
            tableName="Logs"
            data={logs}
          />
        )}
      </div>
    </Page>
  )
}
