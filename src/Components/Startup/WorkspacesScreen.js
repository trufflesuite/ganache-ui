import React, { Component } from 'react'

import connect from '../Helpers/connect'

class WorkspacesScreen extends Component {
  constructor (props) {
    super(props)
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
                return <li key={workspaceName}>{workspaceName}</li>
              })
            }
          </ul>
        </div>
      </div>
    )
  }
}

export default connect(WorkspacesScreen, "workspaces")
