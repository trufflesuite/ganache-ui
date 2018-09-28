import React, { Component } from 'react'

import { openWorkspace, openDefaultWorkspace } from '../../../common/redux/workspaces/actions'
import connect from '../helpers/connect'

import ChainIcon from '../../icons/key.svg'
import MenuIcon from '../../icons/key.svg'

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

  createNewBlockchain() {
    this.props.dispatch(openDefaultWorkspace())
  }

  customizeBlockchain() {
    this.props.dispatch(openDefaultWorkspace())
  }

  render () {
    const workSpaces = this.props.workspaces.names
    let workspaces;
    const hasWorkspaces = this.props.workspaces.names.length;
    
    if(hasWorkspaces) {
      workspaces = this.props.workspaces.names.map((workspaceName) => {
        return <li key={workspaceName}><a onClick={this.selectWorkspace.bind(this)}>{workspaceName}</a></li>
      })
    } else  {
      workspaces = <li>
        <p>Create a NEW BLOCKCHAIN to quickly get started with sensible default options.</p>
        <p>CUSTOMIZE a new blockchain workspace to your liking with options for Truffle projects, ports, gas, and more!.</p>
      </li>
    }

    let updateMessage = "UPDATE SPINNINGS";

    return (
      <div className="WorkspacesScreenContainer">
        <div className="WorkspacesScreen">

          <header>
            <div class="logo">
              <img src="logo.svg" />
              <span class="version">version</span>
            </div>
            <div class="updates">{updateMessage}</div>
          </header>
          <section>
            <div>
              <ul>
                {workspaces}
              </ul>
            </div>
            <div>
              <button onClick={this.createNewBlockchain.bind(this)}><ChainIcon />NEW BLOCKCHAIN</button>
              <button onClick={this.customizeBlockchain.bind(this)}><MenuIcon />CUSTOMIZE</button>
            </div>
          </section>

          {/* <button
            onClick={this.openDefaultWorkspace.bind(this)}
          >
            Instachain
          </button> */}
        </div>
      </div>
    )
  }
}

export default connect(WorkspacesScreen, "workspaces")
