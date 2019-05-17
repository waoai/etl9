// @flow

import React, { useEffect, useState } from "react"
import Page from "../Page"
import TextField from "@material-ui/core/TextField"
import { makeStyles } from "@material-ui/styles"
import { useAPI } from "../APIProvider"
import ListSearch from "../ListSearch"
import Button from "@material-ui/core/Button"
import TypeEditor from "../TypeEditor"

const useStyles = makeStyles({
  root: { padding: 20 },
  actions: { paddingTop: 20, textAlign: "right" },
  nav: {
    paddingBottom: 20
  }
})

export const TypesPage = () => {
  const c = useStyles()
  const api = useAPI()
  const [searchValue, changeSearchValue] = useState("")
  const [types, changeTypes] = useState([])
  const { getTypes } = useAPI()
  useEffect(() => {
    getTypes().then(types => {
      changeTypes(types)
    })
  })

  const [selectedType, changeSelectedType] = useState()

  return (
    <Page title="Types">
      {!selectedType ? (
        <ListSearch
          items={types.map(type => ({
            ...type,
            label: type.name,
            description: type.description
          }))}
          onSelect={changeSelectedType}
        />
      ) : (
        <div className={c.root}>
          <div className={c.nav}>
            <Button onClick={() => changeSelectedType(null)}>
              Back to Search
            </Button>
          </div>
          <TypeEditor type={selectedType} onChange={changeSelectedType} />
          <div className={c.actions}>
            <Button onClick={async () => {}}>Save</Button>
          </div>
        </div>
      )}
    </Page>
  )
}

export default TypesPage
