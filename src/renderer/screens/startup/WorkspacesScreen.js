import React, { Component } from 'react'

import { openWorkspace, openDefaultWorkspace } from '../../../common/redux/workspaces/actions'
import connect from '../helpers/connect'

class WorkspacesScreen extends Component {
  constructor (props) {
    super(props)
  }

  openDefaultWorkspace() {
    this.props.dispatch(openDefaultWorkspace())
  }

  selectWorkspace(e) {
    this.props.dispatch(openWorkspace(e.target.innerText))
  }

  render () {
    return (
      <div className="WorkspacesScreenContainer">
        <div className="WorkspacesScreen">
          <button
            onClick={this.openDefaultWorkspace.bind(this)}
          >
            Instachain
          </button>
          <ul>
            {this.props.workspaces.names.map((workspaceName) => {
                return <li key={workspaceName}><a onClick={this.selectWorkspace.bind(this)}>{workspaceName}</a></li>
              })
            }
          </ul>
        </div>
      </div>
    )
  }
}

export default connect(WorkspacesScreen, "workspaces")
