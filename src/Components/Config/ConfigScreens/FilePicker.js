import React, { Component } from 'react'

class FilePicker extends Component {
  constructor (props) {
    super(props)

    this.state = {
      logDirectory: props.value || props.defaultValue
    }
  }

  clickPickerButton = () => {
    if (this.pickerButton) {
      this.pickerButton.click()
    }
  }

  changePicker = (e) => {
    const value = this.pickerButton.files.length > 0 ? this.pickerButton.files[0].path : this.props.defaultValue

    this.props.onChangeFunction(value, e)

    this.setState({
      logDirectory: value
    })
  }

  render () {
    return (
      <div className="FilePicker">
        <button
          htmlFor={this.props.id}
          onClick={this.clickPickerButton}
        >
          {this.props.buttonValue}
        </button>
        <div>
          <p>{this.state.logDirectory}</p>
          <span className="tooltiptext">{this.state.logDirectory}</span>
        </div>
        <input
          type="file"
          name={this.props.name}
          id={this.props.id}
          webkitdirectory="true"
          ref={input => this.pickerButton = input}
          onChange={this.changePicker}
        />
      </div>
    )
  }
}

export default FilePicker
