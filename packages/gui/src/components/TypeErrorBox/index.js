// @flow

import React from "react"
import { makeStyles } from "@material-ui/styles"
import { green, red, grey, yellow } from "@material-ui/core/colors"
import ErrorIcon from "@material-ui/icons/Error"
import WarningIcon from "@material-ui/icons/Warning"
import CheckIcon from "@material-ui/icons/Check"
import evaluateType from "../../utils/evaluate-type.js"

const useStyles = makeStyles({
  root: {
    border: "1px solid #ccc",
    marginTop: 10,
    marginBottom: 10
  },
  header: {
    fontWeight: "bold",
    fontSize: 14,
    padding: 10,
    borderBottom: "1px solid #ccc"
  },
  content: {
    display: "flex"
  },
  iconContainer: {
    padding: 20
  },
  errorText: {
    padding: 10,
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: 0,
    color: red[500],
    backgroundColor: red[50],
    whiteSpace: "pre-wrap"
  },
  warningText: {
    padding: 10,
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: 0,
    color: yellow[800],
    backgroundColor: yellow[50],
    whiteSpace: "pre-wrap"
  },
  successText: {
    padding: 10,
    flexGrow: 1,
    flexBasis: 0,
    flexShrink: 0,
    color: green[500],
    backgroundColor: green[50]
  },
  typeExpression: {
    padding: 10,
    flexGrow: 1,
    flexBasis: 0,
    flexShrink: 0,
    color: grey[500],
    backgroundColor: grey[50],
    whiteSpace: "pre-wrap"
  }
})

export default ({ typeName, typeExpr, value, optional }) => {
  const c = useStyles()

  const { hasError, errorMessage } = evaluateType(typeExpr, value)

  return (
    <div className={c.root}>
      <div className={c.header}>{typeName}</div>
      <div className={c.content}>
        <div className={c.iconContainer}>
          {hasError && (!optional || value !== undefined) ? (
            <ErrorIcon style={{ color: red[500] }} />
          ) : hasError && optional ? (
            <WarningIcon style={{ color: yellow[800] }} />
          ) : (
            <CheckIcon style={{ color: green[500] }} />
          )}
        </div>
        <div
          className={
            hasError && (!optional || value !== undefined)
              ? c.errorText
              : hasError && optional
              ? c.warningText
              : c.successText
          }
        >
          {errorMessage || "Type is valid."}
        </div>
        <div className={c.typeExpression}>{typeExpr}</div>
      </div>
    </div>
  )
}
