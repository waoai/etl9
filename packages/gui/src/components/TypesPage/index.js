// @flow

import React, { useEffect, useState } from "react"
import Page from "../Page"
import TextField from "@material-ui/core/TextField"
import { makeStyles } from "@material-ui/styles"
import { useAPI } from "../APIProvider"
import ListSearch from "../ListSearch"
import Button from "@material-ui/core/Button"
import TypeEditor from "../TypeEditor"
import AreYouSureButton from "../AreYouSureButton"
import useNavigation from "../../utils/use-navigation.js"

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
  const { navigate } = useNavigation()
  const [searchValue, changeSearchValue] = useState("")
  const [types, changeTypes] = useState([])
  const { getTypes, deleteType, modifyType } = useAPI()
  const [selectedType, changeSelectedType] = useState()
  useEffect(
    () => {
      getTypes().then(types => {
        changeTypes(types)
      })
    },
    [selectedType === null]
  )

  return (
    <Page title="Types">
      {!selectedType ? (
        <ListSearch
          placeholder="Search for Type"
          items={types.map(type => ({
            type,
            label: type.def.name,
            description: type.def.description
          }))}
          onSelect={a => changeSelectedType(a.type)}
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
            <AreYouSureButton
              onClick={async () => {
                await deleteType(selectedType.entity_id)
                changeSelectedType(null)
              }}
            >
              Delete
            </AreYouSureButton>
            <Button
              onClick={async () => {
                await modifyType(selectedType)
                changeSelectedType(null)
              }}
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </Page>
  )
}

export default TypesPage
