// @flow

import React, { useEffect, useState } from "react"
import Page from "../Page"
import TextField from "@material-ui/core/TextField"
import { makeStyles } from "@material-ui/styles"
import { useAPI } from "../APIProvider"

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    padding: 20
  }
})

export const StagesPage = () => {
  const c = useStyles()
  const api = useAPI()
  const [searchValue, changeSearchValue] = useState("")
  const [stages, changeStages] = useState([])
  const { getStages } = useAPI()
  useEffect(() => {
    getStages().then(stages => {
      changeStages(stages)
    })
  })

  return (
    <Page title="Stages">
      <div className={c.root}>
        <TextField
          placeholder="Search for Stage"
          onChange={e => changeSearchValue(e.target.value)}
          value={searchValue}
        />
        <div className={c.stages}>
          {stages.map(stage => (
            <div key={stage.name} className={c.stage}>
              {stage.name}
            </div>
          ))}
        </div>
      </div>
    </Page>
  )
}

export default StagesPage
