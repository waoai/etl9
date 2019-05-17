// @flow

import React from "react"

import { storiesOf } from "@storybook/react"
import { action } from "@storybook/addon-actions"

import PipelinesPage from "./"

storiesOf("PipelinesPage", module).add("Basic", () => <PipelinesPage />)
