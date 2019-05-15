// @flow

import React from "react"
import { makeStyles } from "@material-ui/styles"
import CenteredContent from "../CenteredContent"
import { grey } from "@material-ui/core/colors"

const useStyles = makeStyles({
  root: {
    fontWeight: 800,
    fontSize: 24,
    padding: 12,
    borderBottom: "3px solid #000"
  },
  pageTitle: {
    color: grey[600],
    fontWeight: 600
  }
})

export const Header = ({ pageTitle }: any) => {
  const c = useStyles()
  return (
    <div className={c.root}>
      <CenteredContent>
        <div>
          ETL9<span className={c.pageTitle}> | {pageTitle}</span>
        </div>
      </CenteredContent>
    </div>
  )
}
export default Header
