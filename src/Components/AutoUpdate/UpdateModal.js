import React, { Component, shell } from 'react'

import connect from '../Helpers/connect'

import Modal from '../../Elements/Modal'

import OnlyIf from '../../Elements/OnlyIf'

import ProgressBar from '../../Elements/ProgressBar'

import * as AutoUpdate from '../../Actions/AutoUpdate'

import UpdateIcon from '../../Elements/icons/modal-update.svg'

import renderHtml from 'react-render-html'

import * as os from 'os'

import * as filesize from 'filesize'

const sizeFormatter = filesize.partial({standard: 'jedec'})

class UpdateModal extends Component {
  constructor () {
    super()
    this.scrollDedupeTimeout = null
  }

  renderBody() {
    if (this.props.autoUpdate.downloadError) {
      return this.renderErrorBody()
    } else if (this.props.autoUpdate.downloadInProgress || this.props.autoUpdate.downloadComplete) {
      return this.renderDownloadBody()
    } else {
      return this.renderReleaseDetailsBody()
    }
  }

  renderErrorBody() {
    return (
      <div className="updateDetails">
        <p>An error occurred while downloading your update!</p>
        <div className="releaseNotesOrError">
        { this.props.autoUpdate.downloadError ? (this.props.autoUpdate.downloadError.message || this.props.autoUpdate.downloadError) : '' }
        </div>
      </div>
    )
  }

  renderReleaseDetailsBody() {
    return (
      <div className="updateDetails">
        <p>{this.props.autoUpdate.versionInfo.releaseName || ''}</p>
        <div className="releaseNotesOrError">
          { renderHtml(this.props.autoUpdate.versionInfo.releaseNotes) }
        </div>
      </div>
    )
  }

  renderDownloadBody() {
    return (
      <div className="updateDetails">
        <ProgressBar percent={ this.props.autoUpdate.downloadProgress.percent } />
        { this.renderDownloadStatusText() }
      </div>
    )
  }

  renderDownloadStatusText() {
    if (this.props.autoUpdate.downloadInProgress && this.props.autoUpdate.downloadProgress.percent < 100) {
      return this.renderDownloadSpeed()
    } else {
      return this.renderDownloadComplete()
    }
  }

  renderDownloadSpeed() {
    return <p className="downloadSpeed">{ sizeFormatter(this.props.autoUpdate.downloadProgress.bytesPerSecond || 0) }/s</p>
  }

  renderDownloadComplete() {
    return <p>Download Complete - Restarting!</p>
  }

  renderFooter() {
    return (
      <footer>
        { this.renderCancelButton() }
        { this.renderCallToActionButton() }
      </footer>
    )
  }

  renderCancelButton() {
    if (!this.props.autoUpdate.downloadComplete) {
      return (
        <button className="delayButton" onClick={() => {
          this.props.dispatch(AutoUpdate.cancelUpdate())
        }} >
        Cancel
      </button>
      )
    }
  }

  renderCallToActionButton() {
    if (this.props.autoUpdate.downloadError) {
      return (
        <button className="ctaButton" onClick={() => {
          this.props.dispatch(AutoUpdate.beginDownloading())
        }} >
        Try Again
      </button>
      )
    } else if (!this.props.autoUpdate.downloadComplete && !this.props.autoUpdate.downloadInProgress) {
      if (os.platform() === 'win32') {
        return (
          <button className="ctaButton" onClick={() => {
            shell.openExternal(`https://github.com/trufflesuite/ganache/releases/v${this.props.autoUpdate.versionInfo.newVersion}`)
            // close the modal so they can go about their business
            this.props.dispatch(AutoUpdate.cancelUpdate())
          }} >
          Download Update
        </button>
        )
      } else {
        return (
          <button className="ctaButton" onClick={() => {
            this.props.dispatch(AutoUpdate.beginDownloading())
          }} >
          Download & Install
        </button>
        )
      }
    }
  }

  render () {
    return (
      <Modal className="UpdateModal">
        <section className="Update">
          <UpdateIcon />
          <h4>Release v{this.props.autoUpdate.versionInfo.newVersion} is now available!</h4>
          { this.renderBody() }
          { this.renderFooter() }
        </section>
      </Modal>
    )
  }
}

export default connect(UpdateModal, "autoUpdate")
