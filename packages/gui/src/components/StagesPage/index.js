// @flow

import React, { useEffect, useState } from "react"
import Page from "../Page"
import TextField from "@material-ui/core/TextField"
import { makeStyles } from "@material-ui/styles"
import { useAPI } from "../APIProvider"
import ListSearch from "../ListSearch"
import Button from "@material-ui/core/Button"
import StageEditor from "../StageEditor"
import Diagram from "../Diagram"

const useStyles = makeStyles({
  root: { padding: 20 },
  actions: { paddingTop: 20, textAlign: "right" },
  nav: {
    paddingBottom: 20
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
  const [selectedStage, changeSelectedStage] = useState()
  const [mode, changeMode] = useState("editor")

  return (
    <Page title="Stages">
      {!selectedStage ? (
        <ListSearch
          items={stages.map(stage => ({
            stage,
            label: stage.name,
            description: stage.description
          }))}
          onSelect={item => changeSelectedStage(item.stage)}
        />
      ) : (
        <div className={c.root}>
          <div className={c.nav}>
            <Button onClick={() => changeSelectedStage(null)}>
              Back to Search
            </Button>
          </div>
          {mode === "editor" ? (
            <>
              <StageEditor
                stage={selectedStage}
                onChange={changeSelectedStage}
              />
              <div className={c.actions}>
                <Button onClick={async () => {}}>Save</Button>
              </div>
            </>
          ) : mode === "diagram" ? (
            <>
              <Diagram stages={[selectedStage]} />
            </>
          ) : null}
        </div>
      )}
    </Page>
  )
}

export default StagesPage
