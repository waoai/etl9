// @flow

import React from "react"
import { makeStyles } from "@material-ui/styles"
import classnames from "classnames"
import List from "@material-ui/core/List"
import Divider from "@material-ui/core/Divider"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import { grey, blue } from "@material-ui/core/colors"
import useNavigation from "../../utils/use-navigation.js"

const useStyles = makeStyles({
  item: {
    marginTop: 5,
    marginBottom: 5
  },
  selectedItem: {
    "&&": { backgroundColor: grey[800] },
    "&& span": {
      color: "#fff",
      fontWeight: "bold"
    }
  }
})

const items = [
  { label: "Dashboard", href: "/" },
  { label: "Instances", href: "/instances" },
  { label: "Launch Instance", href: "/launch-instance" },
  "sep",
  { label: "Pipelines", href: "/pipelines" },
  { label: "Stages", href: "/stages" },
  { label: "Types", href: "/types" },
  "sep",
  { label: "Create Pipeline", href: "/create-pipeline" },
  { label: "Create Stage", href: "/create-stage" },
  { label: "Create Type", href: "/create-type" },
  "sep",
  { label: "Environment", href: "/environment" },
  { label: "Errors & Warnings", href: "/errors" }
  // { label: "Settings", href: "/settings" }
]

export const SidebarMenu = ({ currentPageTitle }: any) => {
  const c = useStyles()
  const { navigate } = useNavigation()
  return (
    <div className={c.root}>
      <List>
        {items.map(
          (item, i) =>
            item === "sep" ? (
              <Divider key={i} />
            ) : (
              <ListItem
                button
                onClick={() => navigate(item.href)}
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
