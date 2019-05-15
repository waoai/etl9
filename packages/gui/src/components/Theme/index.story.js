// @flow

import React from "react"

import { storiesOf } from "@storybook/react"
import { action } from "@storybook/addon-actions"

import Theme from "./"

storiesOf("Theme", module).add("Basic", () => (
  <Theme>
    <div>
      <h1>Themed H1 Tag</h1>
      <h2>Themed H2 Tag</h2>
      <h3>Themed H3 Tag</h3>
      <h4>Themed H4 Tag</h4>
      <h5>Themed H5 Tag</h5>
      <p>Paragraph text with this style</p>
      <div>Text in a div</div>
      <div>
        Some <b>bolded text</b>
      </div>
    </div>
  </Theme>
))
