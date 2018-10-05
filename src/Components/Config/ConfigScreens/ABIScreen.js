import React, { Component } from 'react'

import OnlyIf from '../../../Elements/OnlyIf'

const VALIDATIONS = {
  'abi.decode_abi': {
    canBeBlank: true,
    specificValidation: function (e) {
      try {
        // The empty string is valid
        if (!e) {
          return true
        }
        // Must be a valid JSON string and an Array
        return Array.isArray(JSON.parse(e))
      } catch (error) {
        return false
      }
    }
  }
}

class ABIScreen extends Component {
  constructor(props) {
    super(props)
  }

  validateChange = e => {
    this.props.validateChange(e, VALIDATIONS)
  }

  render() {
    return (
      <div className="ABIScreen">
        <h2>ABI</h2>
        <section>
          <div className="ABIDescription">
            <p>The following ABI will be used to decode transaction inputs.</p>
          </div>
          <textarea
            className="ABIInput"
            name="abi.decode_abi"
            value={this.props.config.settings.abi.decode_abi == null ? "" : this.props.config.settings.abi.decode_abi }
            onChange={this.validateChange}/>
          {this.props.validationErrors['abi.decode_abi'] && (
            <p className="ValidationError">Must be a valid JSON array</p>
          )}
        </section>
      </div>
    )
  }
}

export default ABIScreen
