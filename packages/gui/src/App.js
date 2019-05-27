// @flow

import React from "react"
import Theme from "./components/Theme"
import { Locations, Location } from "react-router-component"

import PipelinesPage from "./components/PipelinesPage"
import StagesPage from "./components/StagesPage"
import TypesPage from "./components/TypesPage"
import CreateStagePage from "./components/CreateStagePage"
import CreateTypePage from "./components/CreateTypePage"
import CreatePipelinePage from "./components/CreatePipelinePage"
import LaunchPipelinePage from "./components/LaunchPipelinePage"
import DashboardPage from "./components/DashboardPage"
import EnvironmentPage from "./components/EnvironmentPage"
import SettingsPage from "./components/SettingsPage"
import PipelineInstancePage from "./components/PipelineInstancePage"

function App() {
  return (
    <Theme>
      <Locations>
        <Location path="/" handler={DashboardPage} />
        <Location path="/launch-pipeline" handler={LaunchPipelinePage} />
        <Location path="/pipelines" handler={PipelinesPage} />
        <Location path="/stages" handler={StagesPage} />
        <Location path="/types" handler={TypesPage} />
        <Location path="/create-pipeline" handler={CreatePipelinePage} />
        <Location path="/create-stage" handler={CreateStagePage} />
        <Location path="/create-type" handler={CreateTypePage} />
        <Location path="/settings" handler={SettingsPage} />
        <Location path="/environment" handler={EnvironmentPage} />
        <Location path="/pipeline-instance/*" handler={PipelineInstancePage} />
      </Locations>
    </Theme>
  )
}

export default App
