// @flow

import React, { useState } from "react"
import { makeStyles } from "@material-ui/styles"
import { grey, green, red } from "@material-ui/core/colors"
import WaterObject from "react-watertable/components/Waterobject"
import Button from "@material-ui/core/Button"
import Collapse from "@material-ui/core/Collapse"
import OpenIcon from "@material-ui/icons/KeyboardArrowDown"
import EntryLog from "../EntryLog"

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
      "& .content": {
        display: "flex",
        "& .left": {
          display: "flex",
          flexDirection: "column",
          width: 140,
          "& .leftTitle": {
            fontSize: 11,
            fontWeight: "bold",
            textTransform: "uppercase",
            marginTop: 10,
            color: grey[800]
          },
          "& .leftValue": {
            fontSize: 18
          }
        },
        "& .right": { display: "flex", flexDirection: "column", flexGrow: 1 }
      },
      "& .section": {
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
  instanceId,
  stageInstanceId,
  output,
  status,
  state,
  complete,
  responseTime,
  callCount,
  input,
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
          <div className="content">
            <div className="left">
              <div className="leftTitle">Calls</div>
              <div className="leftValue">
                {callCount !== undefined ? callCount : "???"}
              </div>
              <div className="leftTitle">Response Time</div>
              <div className="leftValue">
                {responseTime ? `${Math.round(responseTime)}ms` : `???`}
              </div>
              <div className="leftTitle">Health</div>
              <div className="leftValue">
                {status !== "error" && callCount && responseTime
                  ? "Good"
                  : "???"}
              </div>
              <div className="leftTitle">Complete</div>
              <div className="leftValue">{complete ? `Yes` : `No`}</div>
            </div>
            <div className="right">
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
                {input && Object.keys(input).length > 0 ? (
                  <WaterObject
                    tableName={`${stageInstanceId} Inputs`}
                    data={input}
                  />
                ) : (
                  <div className={c.empty}>No Input</div>
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
              <div className="section">
                <EntryLog
                  title={stageInstanceId}
                  tags={[stageInstanceId, instanceId]}
                />
              </div>
            </div>
          </div>
        </div>
      </Collapse>
    </div>
  )
}

export default StageInstance
