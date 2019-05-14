import React from "react"
import { Control } from "rete"

class MyReactControl extends React.Component {
  state = {}
  componentDidMount() {
    this.setState({
      name: this.props.name
    })
    this.props.putData(this.props.id, this.props.name)
  }
  onChange(event) {
    this.props.putData(this.props.id, event.target.value)
    this.props.emitter.trigger("process")
    this.setState({
      name: event.target.value
    })
  }

  render() {
    return <input value={this.state.name} onChange={this.onChange.bind(this)} />
  }
}

export class MyControl extends Control {
  constructor(emitter, key, name) {
    super(key)
    this.render = "react"
    this.component = MyReactControl
    this.props = { emitter, id: key, name }
  }
}

export default MyControl
