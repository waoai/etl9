// @flow

import React, { useEffect, useState } from "react"
import WaterTable from "react-watertable"
import { useAPI } from "../APIProvider"

export const EntryLog = ({ tags, title = "" }) => {
  const { getLogs } = useAPI()
  const [logs, changeLogs] = useState()

  useEffect(() => {
    console.log("attempting to load logs")
    getLogs(tags).then(entries => {
      changeLogs(entries)
    })
  }, [])

  if (!logs) {
    return <div>loading</div>
  }

  return (
    <WaterTable
      tableName={`"${title}" Log Entries`}
      canDelete={false}
      canAddMore={false}
      data={logs.map(l => ({
        summary: l.summary,
        info: l.info,
        created_at: l.created_at
      }))}
    />
  )
}

export default EntryLog
