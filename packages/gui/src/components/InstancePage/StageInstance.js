// @flow

import React, { useState } from "react"
import { makeStyles, withStyles } from "@material-ui/styles"
import { grey, green, red } from "@material-ui/core/colors"
import WaterObject from "react-watertable/components/Waterobject"
import Button from "@material-ui/core/Button"
import Collapse from "@material-ui/core/Collapse"
import OpenIcon from "@material-ui/icons/KeyboardArrowDown"
import EntryLog from "../EntryLog"
import Tabs from "@material-ui/core/Tabs"
import Tab from "@material-ui/core/Tab"

const StyledTabs = withStyles({
  indicator: {
    display: "flex",
    justifyContent: "center",
    backgroundColor: "transparent",
    "& > div": {
      maxWidth: 40,
      width: "100%",
      backgroundColor: "#635ee7"
    }
  }
})(props => <Tabs {...props} TabIndicatorProps={{ children: <div /> }} />)

const StyledTab = withStyles({
  root: {
    textTransform: "none",
    minWidth: 0,
    fontWeight: "bold",
    fontSize: 14,
    color: "#fff",
    "&:focus": {
      opacity: 1
    }
  }
})(props => <Tab {...props} />)

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
      height: 500,
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

const tabNames = ["Inputs", "Outputs", "Error", "State", "Logs"]

export const StageInstance = ({
  instanceId,
  stageInstanceId,
  outputs,
  status,
  state,
  complete,
  responseTime,
  callCount,
  inputs,
  progress,
  error
}) => {
  const c = useStyles()
  const [open, changeOpen] = useState(false)
  const [currentTab, changeTab] = useState(tabNames[0])
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
              <div className="leftTitle">Progress</div>
              <div className="leftValue">
                {Math.floor((progress || 0) * 100)}%
              </div>
            </div>
            <div className="right">
              <div className="section">
                <StyledTabs
                  value={tabNames.indexOf(currentTab)}
                  onChange={(e, n) => changeTab(tabNames[n])}
                  textColor="primary"
                  indicatorColor="primary"
                >
                  {tabNames.map(tn => (
                    <StyledTab key={tn} label={tn} />
                  ))}
                </StyledTabs>
              </div>
              {currentTab === "Error" && (
                <div className="section">
                  {error && Object.keys(error).length > 0 ? (
                    <WaterObject
                      key={(error || {}).summary}
                      tableName={`${stageInstanceId} Error`}
                      data={error}
                    />
                  ) : (
                    <div className={c.empty}>No Error</div>
                  )}
                </div>
              )}
              {currentTab === "Inputs" && (
                <div className="section">
                  {inputs && Object.keys(inputs).length > 0 ? (
                    <WaterObject
                      tableName={`${stageInstanceId} Inputs`}
                      data={inputs}
                    />
                  ) : (
                    <div className={c.empty}>No Input</div>
                  )}
                </div>
              )}
              {currentTab === "Outputs" && (
                <div className="section">
                  {outputs && Object.keys(outputs).length > 0 ? (
                    <WaterObject
                      tableName={`${stageInstanceId} Outputs`}
                      data={outputs}
                    />
                  ) : (
                    <div className={c.empty}>No Output</div>
                  )}
                </div>
              )}
              {currentTab === "State" && (
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
              )}
              {currentTab === "Logs" && (
                <div className="section">
                  <EntryLog
                    title={stageInstanceId}
                    tags={[stageInstanceId, instanceId]}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Collapse>
    </div>
  )
}

export default StageInstance
