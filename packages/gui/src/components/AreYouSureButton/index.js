// @flow

import React, { useState } from "react"
import Button from "@material-ui/core/Button"

export default (props: any) => {
  const [clickedOnce, changeClickedOnce] = useState()

  return (
    <Button
      {...props}
      onClick={e => {
        if (clickedOnce) {
          changeClickedOnce(true)
          return props.onClick(e)
        } else {
          changeClickedOnce(true)
          setTimeout(() => {
            changeClickedOnce(false)
          }, 3000)
        }
      }}
    >
      {props.children}
      {clickedOnce ? " (Are you sure?)" : ""}
    </Button>
  )
}
