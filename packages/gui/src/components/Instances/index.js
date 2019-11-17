// @flow

import React, { useState, useEffect } from "react"
import { useAPI } from "../APIProvider"
import { makeStyles, styled } from "@material-ui/styles"
import Button from "@material-ui/core/Button"
import useNavigation from "../../utils/use-navigation.js"
import moment from "moment"
import * as colors from "@material-ui/core/colors"
import CircularProgress from "@material-ui/core/CircularProgress"
import Box from "@material-ui/core/Box"
import PauseIcon from "@material-ui/icons/Pause"

const InstanceContainer = styled(Button)({
  display: "flex",
  alignItems: "center",
  paddingTop: 16,
  paddingBottom: 16,
  marginTop: 16,
  boxShadow: "0px 3px 3px rgba(0,0,0,0.1)"
})
const TitleText = styled("div")({ flexGrow: 1, textAlign: "left" })

export const Instances = ({ pipeline }) => {
  const { navigate } = useNavigation()
  const { getInstances, deleteInstance } = useAPI()
  const [instances, changeInstances] = useState()
  useEffect(() => {
    getInstances(
      pipeline
        ? { pipelineName: pipeline.def.name, minimal: true }
        : {
            minimal: true
          }
    ).then(instances => {
      instances.sort((a, b) => a.created_at.localeCompare(b.created_at))
      changeInstances(instances)
    })
  }, [])

  return (
    <div>
      {instances ? (
        instances.length === 0 ? (
          <div>no instances created yet</div>
        ) : (
          instances.map((instance, i) => (
            <InstanceContainer
              key={i}
              onClick={() => {
                navigate(`/instance/${instance.id}`)
              }}
              variant="outlined"
              fullWidth
            >
              {!instance.paused ? (
                <CircularProgress
                  style={{ marginRight: 16, color: colors.blue[500] }}
                  size={18}
                  thickness={8}
                />
              ) : (
                <PauseIcon style={{ marginRight: 16 }} />
              )}
              <TitleText>{instance.name}</TitleText>
              <div>{moment(instance.created_at).fromNow()}</div>
            </InstanceContainer>
          ))
        )
      ) : (
        <div>loading</div>
      )}
    </div>
  )
}

export default Instances
