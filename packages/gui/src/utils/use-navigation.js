// @flow

import { environment } from "react-router-component"

export const useNavigation = () => {
  return {
    navigate: (href: string) => {
      environment.defaultEnvironment.navigate(href)
    },
    getURLParams: () => {
      return {
        path: window.location.pathname.split("/").slice(1)
      }
    }
  }
}

export default useNavigation
