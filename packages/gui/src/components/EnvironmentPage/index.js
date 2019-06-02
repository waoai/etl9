// @flow

import React, { useState, useEffect } from "react"
import Page from "../Page"
import TextField from "@material-ui/core/TextField"
import { useAPI } from "../APIProvider"
import { makeStyles } from "@material-ui/styles"
import classnames from "classnames"
import Checkbox from "@material-ui/core/Checkbox"
import set from "lodash/set"
import cloneDeep from "lodash/cloneDeep"
import Button from "@material-ui/core/Button"
import IconButton from "@material-ui/core/IconButton"
import GarbageIcon from "@material-ui/icons/Delete"

const useStyles = makeStyles({
  row: {
    display: "flex",
    "& .header": {
      fontWeight: "bold"
    }
  },
  rowName: {
    display: "flex",
    padding: 10,
    flexGrow: 1,
    flexShrink: 0,
    alignItems: "center"
  },
  rowValue: { padding: 10, flexGrow: 1, flexShrink: 0 },
  rowCheck: {
    textAlign: "center",
    flexShrink: 0,
    width: 100,
    "&.header": {
      padding: 10
    }
  },
  actions: {
    padding: 10,
    marginTop: 10,
    textAlign: "right"
  },
  trashIcon: {
    padding: 0,
    margin: 0,
    width: 16,
    height: 16,
    "& .icon": {
      margin: 0,
      padding: 0,
      marginTop: -8,
      width: 16,
      height: 16
    }
  }
})

export const EnvironmentPage = () => {
  const c = useStyles()
  const { getEnvVars, saveEnvVars } = useAPI()
  const [envVars, changeEnvVars] = useState()
  useEffect(() => {
    getEnvVars().then(envVars => {
      changeEnvVars(envVars.map(a => ({ ...a, hideValue: a.encrypted })))
    })
  }, [])
  return (
    <Page title="Environment">
      {!envVars ? (
        <div>loading</div>
      ) : (
        <div>
          <div className={c.row}>
            <div className={classnames(c.rowName, "header")}>Name</div>
            <div className={classnames(c.rowValue, "header")}>Value</div>
            <div className={classnames(c.rowCheck, "header")}>Encrypted</div>
          </div>
          {envVars
            .concat([{ name: "", value: "" }])
            .map(({ name, value, encrypted, hideValue, removed }, i) =>
              removed ? null : (
                <div key={i} className={c.row}>
                  <div className={c.rowName}>
                    <IconButton
                      onClick={() => {
                        changeEnvVars(
                          set(cloneDeep(envVars), [i, "removed"], true)
                        )
                      }}
                      size="small"
                      edge="end"
                      className={c.trashIcon}
                    >
                      <GarbageIcon className="icon" />
                    </IconButton>
                    <TextField
                      fullWidth
                      value={name || ""}
                      onChange={e => {
                        changeEnvVars(
                          set(cloneDeep(envVars), [i, "name"], e.target.value)
                        )
                      }}
                    />
                  </div>
                  <div className={c.rowValue}>
                    <TextField
                      fullWidth
                      value={!hideValue ? value || "" : "***********"}
                      onChange={e => {
                        changeEnvVars(
                          set(cloneDeep(envVars), [i, "value"], e.target.value)
                        )
                      }}
                    />
                  </div>
                  <div className={c.rowCheck}>
                    <Checkbox
                      onChange={(e, checked) => {
                        changeEnvVars(
                          set(
                            set(cloneDeep(envVars), [i, "encrypted"], checked),
                            [i, "hideValue"],
                            false
                          )
                        )
                      }}
                      checked={encrypted || false}
                    />
                  </div>
                </div>
              )
            )}
          <div className={c.actions}>
            <Button
              onClick={async () => {
                await saveEnvVars(
                  envVars
                    .filter(ev => !ev.removed)
                    .map(ev => ({
                      name: ev.name,
                      value: ev.value,
                      encrypted: ev.encrypted
                    }))
                )
                await getEnvVars().then(envVars => {
                  changeEnvVars(
                    envVars.map(a => ({ ...a, hideValue: a.encrypted }))
                  )
                })
              }}
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </Page>
  )
}

export default EnvironmentPage
