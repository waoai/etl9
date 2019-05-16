// @flow

import React from "react"
import { makeStyles } from "@material-ui/styles"
import classnames from "classnames"
import List from "@material-ui/core/List"
import Divider from "@material-ui/core/Divider"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import { grey } from "@material-ui/core/colors"

const useStyles = makeStyles({
  item: {
    marginTop: 5,
    marginBottom: 5
  },
  selectedItem: {
    backgroundColor: grey[100],
    "&& span": {
      fontWeight: "bold"
    }
  }
})

const items = [
  { label: "Active Pipelines" },
  "sep",
  { label: "Pipeline Templates" },
  { label: "Stages" },
  { label: "Types" },
  "sep",
  { label: "Create Pipeline Template" },
  { label: "Create Stage" },
  { label: "Create Type" }
]

export const SidebarMenu = ({ currentPageTitle }: any) => {
  const c = useStyles()
  return (
    <div className={c.root}>
      <List>
        {items.map(item =>
          item === "sep" ? (
            <Divider />
          ) : (
            <ListItem
              button
              key={item.label}
              disabled={currentPageTitle === item.label}
              className={classnames(
                c.item,
                currentPageTitle === item.label && c.selectedItem
              )}
            >
              <ListItemText>{item.label}</ListItemText>
            </ListItem>
          )
        )}
      </List>
    </div>
  )
}

export default SidebarMenu
