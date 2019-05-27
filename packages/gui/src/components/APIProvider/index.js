// @flow

import React, { createContext, useContext } from "react"
import * as examples from "./examples"

const delayAndReturn = result => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(result)
    }, 200)
  })
}

const mockData = {
  getPipelineInstances: () => delayAndReturn(examples.pipelineInstances),
  getPipelines: () => delayAndReturn(examples.pipelines),
  getStages: () => delayAndReturn(examples.stages),
  getTypes: () => delayAndReturn(examples.types),
  getEnvVars: () => delayAndReturn(examples.envVars)
}

export const APIProvider = createContext(mockData)

export const useAPI = () => {
  return useContext(APIProvider)
}
