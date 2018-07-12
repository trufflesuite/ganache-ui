import React, { Component } from 'react'

import { openWorkspace } from '../../Actions/Workspaces'
import connect from '../Helpers/connect'

class WorkspacesScreen extends Component {
  constructor (props) {
    super(props)
  }

  selectWorkspace(e) {
    this.props.dispatch(openWorkspace(e.target.innerText))
  }

  render () {
    return (
      <div className="WorkspacesScreenContainer">
        <div className="WorkspacesScreen">
          <button>
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
