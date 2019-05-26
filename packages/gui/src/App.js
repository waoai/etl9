// @flow

import React from "react"
import Theme from "./components/Theme"
import { Locations, Location } from "react-router-component"

import PipelinesPage from "./components/PipelinesPage"
import StagesPage from "./components/StagesPage"
import TypesPage from "./components/TypesPage"
import CreateStagePage from "./components/CreateStagePage"
import CreateTypePage from "./components/CreateTypePage"

function App() {
  return (
    <Theme>
      <Locations>
        <Location path="/" handler={PipelinesPage} />
        <Location path="/stages" handler={StagesPage} />
        <Location path="/types" handler={TypesPage} />
        <Location path="/create-stage" handler={CreateStagePage} />
        <Location path="/create-type" handler={CreateTypePage} />
      </Locations>
    </Theme>
  )
}

export default App
