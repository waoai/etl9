// @flow

import { definitions, envVars } from "./examples"

export default async db => {
  if (!db) db = await getDB()
  for (const def of definitions) {
    await db("definition").insert({ def })
  }
  for (const envVar of envVars) {
    await db("env_var").insert(envVar)
  }
}
