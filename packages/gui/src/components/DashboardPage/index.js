// @flow

import React from "react"
import Page from "../Page"
import { makeStyles } from "@material-ui/styles"

const useStyles = makeStyles({})

export const DashboardPage = () => {
  const c = useStyles()
  return <Page title="Dashboard">dashboard</Page>
}

export default DashboardPage
