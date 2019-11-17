// @flow

import React, { useState, useEffect } from "react"
import Page from "../Page"
import { makeStyles } from "@material-ui/styles"
import useNavigation from "../../utils/use-navigation.js"
import Instances from "../Instances"

const useStyles = makeStyles({
  root: {
    padding: 20
  }
})

export default () => {
  const c = useStyles()
  const { navigate } = useNavigation()

  return (
    <Page title="Instances">
      <div className={c.root}>
        <Instances />
      </div>
    </Page>
  )
}
