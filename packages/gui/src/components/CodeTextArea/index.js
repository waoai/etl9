// @flow

import React, { useRef } from "react"
import { makeStyles } from "@material-ui/styles"

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column"
  },
  textArea: {
    fontFamily: "monospace",
    minHeight: 400,
    lineHeight: 1.5
  }
})

export const CodeTextArea = ({ onChange, value, error }: any) => {
  const c = useStyles()
  const textArea = useRef()
  return (
    <div className={c.root}>
      <textarea
        ref={textArea}
        onKeyDown={e => {
          if (e.key === "Tab") {
            e.preventDefault()
            const { selectionStart, selectionEnd } = e.target
            const newValue =
              value.substring(0, selectionStart) +
              "  " +
              value.substring(selectionEnd)
            onChange(newValue)
            if (textArea.current) {
              // setTimeout(() => {
              textArea.current.value = newValue
              textArea.current.selectionStart = textArea.current.selectionEnd =
                selectionStart + 2
              // }, 60)
            }
          }
        }}
        placeholder="Type Definition in superstruct format e.g. { someProperty: 'string' }"
        className={c.textArea}
        style={
          !error
            ? undefined
            : {
                border: "2px solid #f00"
              }
        }
        onChange={e => onChange(e.target.value)}
        value={value}
      />
      {error && <div style={{ color: "#f00" }}>{error}</div>}
    </div>
  )
}

export default CodeTextArea
