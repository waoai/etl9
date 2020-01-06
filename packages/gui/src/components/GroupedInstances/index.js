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
import Collapse from "@material-ui/core/Collapse"
import KeyboardArrowDown from "@material-ui/icons/KeyboardArrowDown"
import ExpandIcon from "@material-ui/icons/ExpandMore"

const AnimatedExpandIcon = styled(ExpandIcon)({
  transition: "transform 0.3s ease"
})
const InstanceGroupContainer = styled("div")({})
const InstanceGroupButton = styled(Button)({
  display: "flex",
  width: "100%",
  boxSizing: "content-box",
  alignItems: "center"
})
const InstanceContainer = styled(Button)({
  display: "flex",
  alignItems: "center",
  paddingTop: 16,
  paddingBottom: 16,
  marginTop: 16,
  boxShadow: "0px 3px 3px rgba(0,0,0,0.1)"
})
const TitleText = styled("div")({ flexGrow: 1, textAlign: "left" })

const ProgressCircle = ({ marginLeft = 0, marginRight = 16 }) => (
  <CircularProgress
    style={{ marginLeft, marginRight, color: colors.blue[500] }}
    size={18}
    thickness={8}
  />
)

const InstanceGroupInfoBox = ({ children }) => (
  <Box
    style={{ backgroundColor: "#ddd" }}
    borderRadius={4}
    padding="4px"
    paddingLeft="8px"
    marginRight="8px"
    display="inline-flex"
    alignItems="center"
  >
    {children}
  </Box>
)

const InstanceGroup = ({ groupName, instances }) => {
  const { navigate } = useNavigation()
  const [groupOpen, changeGroupOpen] = useState(false)
  return (
    <InstanceGroupContainer key={groupName}>
      <InstanceGroupButton
        onClick={() => changeGroupOpen(!groupOpen)}
        fullWidth
      >
        <Box flexGrow={1} textAlign="left" alignItems="center" display="flex">
          {instances.some(a => !a.paused) && (
            <InstanceGroupInfoBox>
              {instances.filter(a => !a.paused).length}{" "}
              <ProgressCircle marginLeft={8} marginRight={8} />
            </InstanceGroupInfoBox>
          )}
          {instances.some(a => a.paused) && (
            <InstanceGroupInfoBox>
              {instances.filter(a => a.paused).length} <PauseIcon />
            </InstanceGroupInfoBox>
          )}
          {groupName}
        </Box>
        <Box>
          <AnimatedExpandIcon
            style={{ transform: `rotate(${groupOpen ? "180" : "0"}deg)` }}
          />
        </Box>
      </InstanceGroupButton>
      <Collapse in={groupOpen}>
        {instances.map((instance, i) => (
          <InstanceContainer
            key={i}
            onClick={() => {
              navigate(`/instance/${instance.id}`)
            }}
            variant="outlined"
            fullWidth
          >
            {!instance.paused ? (
              <ProgressCircle />
            ) : (
              <PauseIcon style={{ marginRight: 16 }} />
            )}
            <TitleText>
              {instance.id}
              {instance.name ? ` (${instance.name})` : ""}
            </TitleText>
            <div>{moment(instance.created_at).fromNow()}</div>
          </InstanceContainer>
        ))}
        <div style={{ paddingBottom: 32 }} />
      </Collapse>
    </InstanceGroupContainer>
  )
}

export const Instances = ({ pipeline }) => {
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

  const groups = Array.from(
    new Set((instances || []).map(instance => instance.name))
  )
  groups.sort()

  console.log({ groups, instances })

  return (
    <div>
      {instances ? (
        instances.length === 0 ? (
          <div>no instances created yet</div>
        ) : (
          groups.map(groupName => (
            <InstanceGroup
              groupName={groupName || "Undefined"}
              key={groupName || "Undefined"}
              instances={instances.filter(
                instance => instance.name === groupName
              )}
            />
          ))
        )
      ) : (
        <div>loading</div>
      )}
    </div>
  )
}

export default Instances
