import React, { Component } from "react";

// Single value FilePicker. Needs adjustment to support multi-file picking (or new component)

/* Example:
 * <FilePicker
 *   id="Logdirectory"
 *   name="logDirectory"
 *   defaultValue="Select a Directory"
 *   buttonValue="Pick a Folder"
 *   directoriesOnly={true}
 *   value={this.state.logDirectory}
 *   onChangeFunction={(value, e) => this.changeLogDirectory(value, e)}
 * />
 */

class FilePicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value || props.defaultValue,
    };
  }

  clickPickerButton = () => {
    if (this.pickerButton) {
      this.pickerButton.click();
    }
  };

  changePicker = e => {
    const value =
      this.pickerButton.files.length > 0
        ? this.pickerButton.files[0].path
        : this.props.defaultValue;

    this.props.onChangeFunction(value, e);

    this.setState({
      value: value,
    });
  };

  render() {
    return (
      <div className={`FilePicker ${this.props.className || ""}`}>
        <button htmlFor={this.props.id} onClick={this.clickPickerButton}>
          {this.props.buttonValue}
        </button>
        <div>
          <p>{this.state.value}</p>
          <span className="tooltiptext">{this.state.value}</span>
        </div>
        <input
          type="file"
          name={this.props.name}
          id={this.props.id}
          webkitdirectory={this.props.directoriesOnly ? "true" : null}
          ref={input => (this.pickerButton = input)}
          onChange={this.changePicker}
        />
      </div>
    );
  }
}

export default FilePicker;
