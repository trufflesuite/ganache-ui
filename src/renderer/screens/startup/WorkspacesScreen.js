import React, { Component } from 'react'
import { Scrollbars } from 'react-custom-scrollbars';

import { initAutoUpdates, getAutoUpdateService } from '../../init/AutoUpdate'
import * as pkg from '../../../../package.json'

import OnlyIf from '../../../renderer/components/only-if/OnlyIf'
import { openWorkspace, openDefaultWorkspace } from '../../../common/redux/workspaces/actions'
import UpdateNotification from '../auto-update/UpdateNotification'
import UpdateModal from '../auto-update/UpdateModal'
import connect from '../helpers/connect'

import Spinner from '../../components/spinner/Spinner'

import Logo from '../../../../Logo.svg'
import ChainIcon from '../../icons/chain.svg'
import MenuIcon from '../../icons/list.svg'
import PlayIcon from '../../icons/key.svg'

class WorkspacesScreen extends Component {
  constructor (props) {
    super(props)
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
    let workspaces
    const hasWorkspaces = this.props.workspaces.names.length
    
    if(hasWorkspaces) {
      workspaces = this.props.workspaces.names.map((workspaceName, i) => {
        return <li key={workspaceName}><button autoFocus={i === 0 ? "autofocus": false} onClick={this.selectWorkspace.bind(this)}>{workspaceName}<PlayIcon /></button></li>
      })
    } else {
      workspaces = <li>
        <p>Create a NEW BLOCKCHAIN to quickly get started with sensible default options.</p>
        <p>CUSTOMIZE a new blockchain workspace to your liking with options for Truffle projects, ports, gas, and more!</p>
      </li>
    }

    const title = hasWorkspaces ? <h1 className="title">Recent</h1> : <h1 className="title">Welcome to Ganache!</h1>
    const subTitle = hasWorkspaces ? <p className="subTitle">Click the name of an existing workspace to launch.</p> : <p>&nbsp;</p>
    const isNewVersionAvailable = this.props.autoUpdate.isNewVersionAvailable
    const isCheckingForUpdate = this.props.autoUpdate.updateCheckInProgress

    return (
      <React.Fragment>
        <div className="WorkspacesScreenContainer">
          <Scrollbars>
            <div className="WorkspacesScreen">

              <header>
                <div className="logo">
                  <Logo/>Ganache
                  <span className="version"> v{pkg.version}</span>
                </div>
                <div className="updates">
                  <OnlyIf test={isCheckingForUpdate && !isNewVersionAvailable}>
                    <Spinner/>Checking for Updates&hellip;
                  </OnlyIf>
                  <OnlyIf test={isNewVersionAvailable}>
                    <UpdateNotification />
                  </OnlyIf>
                </div>
              </header>
              <div className="WorkspacesBody">
                {title}
                {subTitle}
                <section>
                  <div className="left">
                    <ul>
                      {workspaces}
                    </ul>
                  </div>
                  <div className="right">
                    <button onClick={this.createNewBlockchain.bind(this)}><ChainIcon />NEW BLOCKCHAIN</button>
                    <button onClick={this.customizeBlockchain.bind(this)}><MenuIcon />CUSTOMIZE</button>
                  </div>
                </section>
              </div>
            </div>
          </Scrollbars>
        </div>
        <OnlyIf test={!this.props.core.systemError && this.props.autoUpdate.showModal}>
          <UpdateModal />
        </OnlyIf>
      </React.Fragment>
    )
  }
}

export default connect(WorkspacesScreen, "workspaces", "core", "autoUpdate")
