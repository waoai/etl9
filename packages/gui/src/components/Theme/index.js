// @flow

import React from "react"
import { makeStyles } from "@material-ui/styles"
import createMuiTheme from "@material-ui/core/styles/createMuiTheme"
import { blue } from "@material-ui/core/colors"
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider"
import "./theme.css"

const useStyles = makeStyles({
  container: {
    fontFamily: '"Inter UI", sans-serif',
    "& a": {
      color: blue[500],
      textDecoration: "none"
    },
    "& h1,h2,h3,h4,h5": {
      margin: 0,
      "& i": {
        opacity: 0.75
      }
    }
  }
})

const theme = createMuiTheme({
  typography: {
    fontFamily: '"Inter UI", "Roboto", sans-serif'
  },
  overrides: {
    MuiButton: {
      root: {
        textTransform: "none"
      },
      subheading: { fontWeight: "bold" }
    }
  }
})

export default ({ children }) => {
  const classes = useStyles()
  return (
    <MuiThemeProvider theme={theme}>
      <div className={classes.container}>{children}</div>
    </MuiThemeProvider>
  )
}
