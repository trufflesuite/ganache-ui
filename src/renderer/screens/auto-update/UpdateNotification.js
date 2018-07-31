import React, { Component } from 'react'

import connect from '../Helpers/connect'
import { showUpdateModal } from '../../Actions/AutoUpdate'

import UpdateIcon from '../../Elements/icons/chevron-up-o.svg'

class UpdateNotification extends Component {
  constructor() {
    super()
    this.state = {}
  }

  handleUpdateClick(e) {
    this.props.dispatch(showUpdateModal())
  }

  render() {
    return (
      <div className="UpdateNotification">
        <a className="UpdateBtn" onClick={this.handleUpdateClick.bind(this)} >
          <UpdateIcon /> Update Available
        </a>
      </div>
    )
  }
}

export default connect(UpdateNotification)
