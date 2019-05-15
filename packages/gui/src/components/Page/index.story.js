// @flow

import React from "react"

import { storiesOf } from "@storybook/react"
import { action } from "@storybook/addon-actions"

import Page from "./"

storiesOf("Page", module).add("Basic", () => (
  <Page title="Pipelines">Content</Page>
))
