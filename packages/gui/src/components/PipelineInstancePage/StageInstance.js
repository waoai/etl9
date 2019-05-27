// @flow

import React, { useState } from "react"
import { makeStyles } from "@material-ui/styles"
import { grey, green, red } from "@material-ui/core/colors"
import WaterObject from "react-watertable/components/Waterobject"
import Button from "@material-ui/core/Button"
import Collapse from "@material-ui/core/Collapse"
import OpenIcon from "@material-ui/icons/KeyboardArrowDown"

const useStyles = makeStyles({
  stageInstance: {
    // marginTop: 20,
    padding: 10,
    backgroundColor: grey[100],
    borderTop: `2px solid ${grey[400]}`,
    // borderBottom: `2px solid ${grey[400]}`,
    "& > .header": {
      display: "flex",
      fontSize: 18,
      "& .title": {
        textAlign: "left",
        fontWeight: "bold",
        flexGrow: 1
      },
      "& .open-icon": {
        transition: "transform 400ms"
      }
    },
    "& .collapsedContent": {
      marginTop: 10,
      "& > .section": {
        marginTop: 10,
        backgroundColor: "#fff"
      }
    }
  },
  empty: {
    fontSize: 18,
    fontWeight: "bold",
    color: grey[600],
    textAlign: "center",
    padding: 20
  }
})

export const StageInstance = ({
  stageInstanceId,
  output,
  status,
  state,
  error
}) => {
  const c = useStyles()
  const [open, changeOpen] = useState(false)
  return (
    <div className={c.stageInstance}>
      <Button onClick={() => changeOpen(!open)} fullWidth className="header">
        <div className="title">{stageInstanceId}</div>
        <div className="stats">
          <div>{status}</div>
        </div>
        <OpenIcon
          className="open-icon"
          style={{ transform: `rotate(${open ? "-180" : "0"}deg)` }}
        />
      </Button>
      <Collapse in={open}>
        <div className="collapsedContent">
          <div className="section">
            {error && Object.keys(error).length > 0 ? (
              <WaterObject
                tableName={`${stageInstanceId} Error`}
                data={error}
              />
            ) : (
              <div className={c.empty}>No Error</div>
            )}
          </div>
          <div className="section">
            {output && Object.keys(output).length > 0 ? (
              <WaterObject
                tableName={`${stageInstanceId} Outputs`}
                data={output}
              />
            ) : (
              <div className={c.empty}>No Output</div>
            )}
          </div>
          <div className="section">
            {state && Object.keys(state).length > 0 ? (
              <WaterObject
                tableName={`${stageInstanceId} State`}
                data={state}
              />
            ) : (
              <div className={c.empty}>No State</div>
            )}
          </div>
        </div>
      </Collapse>
    </div>
  )
}

export default StageInstance
