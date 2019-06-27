// @flow
import { struct } from "superstruct"
import safeEval from "safe-eval"

export default (typeExpr: string, value: any) => {
  let error, method
  try {
    method = safeEval(`struct(${typeExpr})`, {
      struct,
      any: "any",
      string: "string",
      number: "number",
      boolean: "boolean"
    })
  } catch (e) {
    error = `Error evaluating type:\n${e.toString()}`
  }
  if (method) {
    try {
      method(value)
    } catch (e) {
      error = e.toString()
    }
  }
  return { hasError: Boolean(error), errorMessage: error }
}
