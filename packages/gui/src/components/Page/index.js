// @flow

import React from "react"
import { makeStyles } from "@material-ui/styles"
import Header from "../Header"
import CenteredContent from "../CenteredContent"
import SidebarMenu from "../SidebarMenu"
import Grid from "@material-ui/core/Grid"

const useStyles = makeStyles({
  contentContainer: {
    minHeight: "100vh",
    borderLeft: "3px solid #000"
  }
})

export const Page = ({ title, children }: any) => {
  const c = useStyles()
  return (
    <div className={c.root}>
      <Header pageTitle={title} />
      <CenteredContent>
        <Grid container>
          <Grid item xs={12} sm={4} md={3} lg={2}>
            <SidebarMenu currentPageTitle={title} />
          </Grid>
          <Grid item xs={12} sm={8} md={9} lg={10}>
            <div className={c.contentContainer}>{children}</div>
          </Grid>
        </Grid>
      </CenteredContent>
    </div>
  )
}

export default Page
