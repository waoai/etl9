// @flow

import React from "react"
import { makeStyles } from "@material-ui/styles"

const useStyles = makeStyles({
  container: {
    display: "flex",
    justifyContent: "center"
  },
  innerContent: {
    display: "inline-flex",
    maxWidth: 1200,
    width: "100%",
    flexDirection: "column",
    justifyContent: "flex-start"
  }
})

export default props => {
  const classes = useStyles()
  return (
    <div className={classes.container}>
      <div className={classes.innerContent} {...props}>
        {props.children}
      </div>
    </div>
  )
}
