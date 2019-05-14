// @flow

import React from "react"
import { makeStyles } from "@material-ui/styles"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import Paper from "@material-ui/core/Paper"

const useStyles = makeStyles({
  root: {
    padding: 20
  },
  header: {
    fontSize: 24,
    fontWeight: "bold"
  },
  description: {
    marginTop: 20,
    fontSize: 18
  },
  sectionHeader: {
    fontSize: 24,
    paddingTop: 20,
    paddingBottom: 20
  },
  tableContainer: {
    border: `1px solid #ccc`,
    borderRadius: 4
  }
})

export const StageDoc = ({ stageName, description, inputs, outputs }) => {
  const c = useStyles()
  return (
    <div className={c.root}>
      <div className={c.header}>{stageName}</div>
      <div className={c.description}>{description}</div>
      <div className={c.sectionHeader}>Inputs</div>
      {!inputs ? (
        "No Inputs"
      ) : (
        <div className={c.tableContainer}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Property</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(inputs).map(inp => (
                <TableRow key={inp}>
                  <TableCell>{inputs[inp].name}</TableCell>
                  <TableCell>{inputs[inp].type}</TableCell>
                  <TableCell>{inputs[inp].description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <div className={c.sectionHeader}>Outputs</div>
      {!outputs ? (
        "No Outputs"
      ) : (
        <div className={c.tableContainer}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Property</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(outputs).map(outKey => (
                <TableRow key={outKey}>
                  <TableCell>{outputs[outKey].name}</TableCell>
                  <TableCell>{outputs[outKey].type}</TableCell>
                  <TableCell>{outputs[outKey].description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

export default StageDoc
