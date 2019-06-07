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
  getInstances: (o = {}) => delayAndReturn(examples.pipelineInstances),
  getPipelines: () => delayAndReturn(examples.pipelines),
  getStages: () => delayAndReturn(examples.stages),
  getTypes: () => delayAndReturn(examples.types),
  getLogs: tags => delayAndReturn([]),
  getEnvVars: () => delayAndReturn(examples.envVars),
  createPipeline: def => Promise.resolve(null),
  createStage: def => Promise.resolve(null),
  createType: def => Promise.resolve(null),
  createInstance: def => Promise.resolve(null),
  createEnvVar: (n, v, o) => Promise.resolve(null),
  modifyPipeline: o => Promise.resolve(null),
  modifyStage: o => Promise.resolve(null),
  modifyType: o => Promise.resolve(null),
  deletePipeline: def => Promise.resolve(null),
  deleteStage: def => Promise.resolve(null),
  deleteType: def => Promise.resolve(null),
  saveEnvVars: def => Promise.resolve(null),
  deleteInstance: def => Promise.resolve(null)
}

const apiFuncs = {
  getInstances: (o = {}) => {
    let reqUrl = "/api/db/instance"
    if (o.id) reqUrl = `/api/db/instance?id=eq.${o.id}`
    if (o.pipelineName)
      reqUrl = `/api/db/instance?pipeline_def->>name=eq.${o.pipelineName}`
    return axios.get(reqUrl).then(res => res.data)
  },
  getPipelines: () => axios.get("/api/db/pipeline_def").then(res => res.data),

  getStages: () => axios.get("/api/db/stage_def").then(res => res.data),
  getTypes: () => axios.get("/api/db/type_def").then(res => res.data),
  getEnvVars: () => axios.get("/api/db/env_var").then(res => res.data),
  createPipeline: def => axios.post("/api/db/definition", { def }),
  createInstance: ({ def, params }) =>
    axios
      .post(
        "/api/db/instance",
        {
          pipeline_def: def,
          params
        },
        { headers: { Prefer: "return=representation" } }
      )
      .then(r => r.data[0]),
  createStage: def => axios.post("/api/db/definition", { def }),
  createType: def => axios.post("/api/db/definition", { def }),
  createEnvVar: (name, value, { encrypted } = { encrypted: false }) =>
    axios.post("/api/db/env_var", { name, value, encrypted }),
  modifyPipeline: ({ def, entity_id }) =>
    axios.patch(`/api/db/definition?entity_id=eq.${entity_id}`, { def }),
  modifyStage: ({ def, entity_id }) =>
    axios.patch(`/api/db/definition?entity_id=eq.${entity_id}`, { def }),
  modifyType: ({ def, entity_id }) =>
    axios.patch(`/api/db/definition?entity_id=eq.${entity_id}`, { def }),
  deletePipeline: entity_id =>
    axios.delete(`/api/db/definition?entity_id=eq.${entity_id}`),
  deleteStage: entity_id =>
    axios.delete(`/api/db/definition?entity_id=eq.${entity_id}`),
  deleteType: entity_id =>
    axios.delete(`/api/db/definition?entity_id=eq.${entity_id}`),
  getLogs: (tags = [], limit = 20) =>
    axios
      .get(
        `/api/db/log_entry?limit=${limit}&tags=cs.{${tags.join(
          ","
        )}}&order=created_at.desc`
      )
      .then(res => res.data),
  saveEnvVars: async vars => {
    await axios.delete("/api/db/env_var")
    for (const v of vars) {
      await axios.post("/api/db/env_var", {
        name: v.name,
        value: v.value,
        encrypted: Boolean(v.encrypted)
      })
    }
  },
  deleteInstance: instance_id =>
    axios.delete(`/api/db/instance?id=eq.${instance_id}`),
  resetInstance: instance_id =>
    axios.patch(`/api/db/instance?id=eq.${instance_id}`, {
      instance_state: {}
    })
}

export const APIContext = createContext(mockFuncs)

export const APIProvider = ({ children }: any) => {
  return <APIContext.Provider value={apiFuncs}>{children}</APIContext.Provider>
}

export const useAPI = () => {
  return useContext(APIContext)
}

export default APIProvider
