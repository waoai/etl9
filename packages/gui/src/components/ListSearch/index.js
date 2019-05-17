// @flow

import React, { useEffect, useState } from "react"
import { makeStyles } from "@material-ui/styles"
import TextField from "@material-ui/core/TextField"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    padding: 20
  }
})

export const ListSearch = ({ items, onSelect }: any) => {
  const c = useStyles()
  const [searchValue, changeSearchValue] = useState("")

  let filteredItems = items
    .map(s =>
      s.label.toLowerCase().includes(searchValue.toLowerCase())
        ? [1, s]
        : s.description.toLowerCase().includes(searchValue.toLowerCase())
        ? [2, s]
        : null
    )
    .filter(Boolean)
  filteredItems.sort((a, b) => a[0] - b[0])
  filteredItems = filteredItems.map(([order, s]) => s)

  return (
    <div className={c.root}>
      <TextField
        placeholder="Search for Stage"
        onChange={e => changeSearchValue(e.target.value)}
        value={searchValue}
      />
      <div className={c.stages}>
        <List>
          {filteredItems.map(item => (
            <ListItem
              button
              onClick={() => onSelect(item)}
              key={item.label}
              className={c.stage}
            >
              <ListItemText primary={item.label} secondary={item.description} />
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  )
}

export default ListSearch
