import React, { Component } from 'react'
import { Scrollbars } from 'react-custom-scrollbars';

import { initAutoUpdates, getAutoUpdateService } from '../../init/AutoUpdate'
import * as pkg from '../../../../package.json'

import OnlyIf from '../../../renderer/components/only-if/OnlyIf'
import { openWorkspace, openDefaultWorkspace, openNewWorkspaceConfig, deleteWorkspace } from '../../../common/redux/workspaces/actions'
import UpdateNotification from '../auto-update/UpdateNotification'
import ErrorModal from '../../components/modal/ErrorModal'
import UpdateModal from '../auto-update/UpdateModal'
import connect from '../helpers/connect'
import ModalDetails from "../../components/modal/ModalDetails"

import Spinner from '../../components/spinner/Spinner'

import Logo from '../../../../Logo.svg'
import ChainIcon from '../../icons/chain.svg'
import MenuIcon from '../../icons/list.svg'
import WelcomeImage from '../../icons/welcome-crane.svg'
import TrashIcon from '../../icons/trash.svg'

class HomeScreen extends Component {
  constructor (props) {
    super(props)
  }

  selectWorkspace(e) {
    const workspaceName = e.currentTarget.querySelector('span').innerText
    this.props.dispatch(openWorkspace(workspaceName))
  }

  handleDeleteWorkspace(e) {
    const workspaceName = e.currentTarget.previousSibling.innerText
    e.stopPropagation()
    e.preventDefault()

    const modalDetails = new ModalDetails(
      ModalDetails.types.WARNING,
      [{
        click: (modal) => {
          this.props.dispatch(deleteWorkspace(workspaceName))
          modal.close()
        },
        value: "Remove"
      },
      {
        value: "Cancel"
      }],
      `"Remove ${workspaceName} Workspace?`,
      `Removing the ${workspaceName} workspace will delete its associated chain, including any deployment, transactions, and event history. Your project source code will not be deleted.`
    )

    this.props.dispatch(ModalDetails.actions.setModalError(modalDetails))
  }

  createNewBlockchain() {
    this.props.dispatch(openDefaultWorkspace())
  }

  customizeBlockchain() {
    this.props.dispatch(openNewWorkspaceConfig())
  }

  render () {
    let workspaces
    const hasWorkspaces = this.props.workspaces.names.length
    
    if(hasWorkspaces) {
      workspaces = this.props.workspaces.names.map((workspaceName, i) => {
        return (
          <li key={workspaceName}>
            <button autoFocus={i === 0 ? "autofocus": false} onClick={this.selectWorkspace.bind(this)}>
              <span>{workspaceName}</span>
              <div className="DeleteWorkspace" onClick={this.handleDeleteWorkspace.bind(this)}>
                <TrashIcon />
              </div>
            </button>
          </li>
        )
      })
      workspaces = <ul>{workspaces}</ul>
    }

    const title = hasWorkspaces ? <h1 className="title left">Workspaces</h1> : <h1 className="title">Create a Workspace</h1>
    const subTitle = <p className="subTitle">Quickstart for a one-click blockchain or create a new workspace for advanced setup options.</p>
    const isNewVersionAvailable = this.props.autoUpdate.isNewVersionAvailable
    const isCheckingForUpdate = this.props.autoUpdate.updateCheckInProgress

    return (
      <React.Fragment>
        <div className="HomeScreenContainer">
          <Scrollbars>
            <div className="HomeScreen">

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
                <OnlyIf test={!hasWorkspaces}>
                  <section>
                    <div className="WelcomeImage">
                      <WelcomeImage />
                    </div>
                    {title}
                    {subTitle}
                  </section>
                </OnlyIf>
                <OnlyIf test={hasWorkspaces}>
                  <section>
                    {title}
                  </section>
                  <section>
                    <div className="top">
                      {workspaces}
                    </div>
                  </section>
                </OnlyIf>
                <section>
                  <div className="bottom">
                    <button onClick={this.createNewBlockchain.bind(this)}><ChainIcon />Quickstart</button>
                    <button onClick={this.customizeBlockchain.bind(this)}><MenuIcon />New Workspace</button>
                  </div>
                </section>
              </div>
            </div>
          </Scrollbars>
        </div>
        <OnlyIf test={this.props.core.modalError != null}>
          <ErrorModal modalError={this.props.core.modalError}></ErrorModal>
        </OnlyIf>
        <OnlyIf test={!this.props.core.systemError && this.props.autoUpdate.showModal}>
          <UpdateModal />
        </OnlyIf>
      </React.Fragment>
    )
  }
}

export default connect(HomeScreen, "workspaces", "core", "autoUpdate")
