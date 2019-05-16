// @flow

import React, { useState } from "react"
import Page from "../Page"
import { makeStyles } from "@material-ui/styles"
import CodeTextArea from "../CodeTextArea"
import Button from "@material-ui/core/Button"
import yaml from "js-yaml"

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    padding: 20
  },
  actions: {
    marginTop: 10,
    display: "flex",
    justifyContent: "flex-end"
  }
})

export const CreateStagePage = () => {
  const c = useStyles()
  const [configString, changeConfigString] = useState(
    `
kind: Stage
name: MyStageName
description: Some stage description
inputs:
  some_input:
    type: string
outputs:
  some_output:
    type: string
  `.trim()
  )

  let error, stageName
  try {
    const doc = yaml.safeLoad(configString)
    stageName = doc.name
    if (!stageName.match(/[A-Z][a-zA-Z]+/))
      throw new Error("Stage names should be CapitalCase")
    if (!doc.kind || doc.kind !== "Stage")
      throw new Error('Must have kind of "Stage"')
  } catch (e) {
    error = e.toString()
  }
  return (
    <Page title="Create Stage">
      <div className={c.root}>
        <CodeTextArea
          error={error}
          onChange={changeConfigString}
          value={configString}
        />
        <div className={c.actions}>
          <Button disabled={error || stageName === null}>
            Create Stage "{stageName ? stageName : ""}"
          </Button>
        </div>
      </div>
    </Page>
  )
}

export default CreateStagePage
