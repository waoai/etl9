// @flow

import React, { useState } from "react"
import Page from "../Page"
import { makeStyles } from "@material-ui/styles"
import Button from "@material-ui/core/Button"
import Checkbox from "@material-ui/core/Checkbox"
import Divider from "@material-ui/core/Divider"

const useStyles = makeStyles({
  sectionHeader: {
    padding: 10,
    fontSize: 24,
    fontWeight: "bold"
  },
  sectionContent: { padding: 10 },
  actions: {
    padding: 10
  }
})

export const SettingsPage = () => {
  const c = useStyles()
  const [exportSettings, changeExportSettings] = useState({
    encryptedInPlainText: false
  })
  return (
    <Page title="Settings">
      <div className={c.sectionHeader}>Settings</div>
      {/* <div className={c.sectionContent}>
        <div>
          <Checkbox
            value={exportSettings.encryptedInPlainText}
            onChange={(e, checked) => {
              // TODO
            }}
          />
          Some Setting
        </div>
      </div>
      <div className={c.actions}>
        <Button disabled>Save Configuration</Button>
      </div>
      <Divider />
      <div className={c.sectionHeader}>Export</div>
      <div className={c.sectionContent}>
        <Checkbox
          value={exportSettings.encryptedInPlainText}
          onChange={(e, checked) =>
            changeExportSettings({
              ...exportSettings,
              encryptedInPlainText: checked
            })
          }
        />
        Export encrypted values in plaintext
      </div>
      <div className={c.actions}>
        <Button disabled>Export as YAML Directory</Button>
        <Button disabled>Export as JSON</Button>
      </div> */}
    </Page>
  )
}

export default SettingsPage
