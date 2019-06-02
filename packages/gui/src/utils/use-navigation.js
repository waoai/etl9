// @flow

import { environment } from "react-router-component"

export const useNavigation = () => {
  return {
    navigate: (href: string) => {
      environment.defaultEnvironment.navigate(href)
    },
    getURLQuery: () => {
      const usp = new URLSearchParams(window.location.search.slice(1))
      const obj = {}
      for (const [k, v] of usp.entries()) obj[k] = v
      return (obj: any)
    },
    getURLParams: () => {
      return {
        path: window.location.pathname.split("/").slice(1)
      }
    }
  }
}

export default useNavigation
