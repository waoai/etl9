// @flow

import React from "react"

import { storiesOf } from "@storybook/react"
import { action } from "@storybook/addon-actions"
import s3InputStage from "../../stages/s3-input.js"

import StageDoc from "./"

storiesOf("StageDoc", module).add("Basic", () => <StageDoc {...s3InputStage} />)
