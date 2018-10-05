import React, { Component } from 'react'

import OnlyIf from '../../../Elements/OnlyIf'

const VALIDATIONS = {
  'abi.decode_abi': {
    specificValidation: function(e) {
      try {
        JSON.parse(e)
      } catch (error) {
        return false
      }
      return true
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
            value={this.props.config.settings.abi.decode_abi}
            onChange={this.validateChange}/>
          {this.props.validationErrors['abi.decode_abi'] && (
            <p className="ValidationError">Must be a valid JSON</p>
          )}
        </section>
      </div>
    )
  }
}

export default ABIScreen
