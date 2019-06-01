// @flow

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo
} from "react"
import * as examples from "./examples"
import axios from "axios"

const delayAndReturn = result => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(result)
    }, 200)
  })
}

const mockFuncs = {
  getPipelineInstances: () => delayAndReturn(examples.pipelineInstances),
  getPipelines: () => delayAndReturn(examples.pipelines),
  getStages: () => delayAndReturn(examples.stages),
  getTypes: () => delayAndReturn(examples.types),
  getEnvVars: () => delayAndReturn(examples.envVars)
}

const apiFuncs = {
  getPipelineInstances: () =>
    axios.get("/api/db/instance").then(res => res.data),
  getPipelines: () =>
    axios
      .get("/api/db/pipeline_def?select=def")
      .then(res => res.data.map(r => r.def)),

  getStages: () =>
    axios
      .get("/api/db/stage_def?select=def")
      .then(res => res.data.map(r => r.def)),
  getTypes: () =>
    axios
      .get("/api/db/type_def?select=def")
      .then(res => res.data.map(r => r.def)),
  getEnvVars: () => axios.get("/api/db/env_var").then(res => res.data)
}

export const APIContext = createContext(mockFuncs)

export const APIProvider = ({ children }: any) => {
  return <APIContext.Provider value={apiFuncs}>{children}</APIContext.Provider>
}

export const useAPI = () => {
  return useContext(APIContext)
}

export default APIProvider
