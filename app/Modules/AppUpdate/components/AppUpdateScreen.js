import React, { Component } from 'react'
const { app } = require('electron').remote

import { hashHistory } from 'react-router'
import TestRPCProvider from 'Data/Providers/TestRPCProvider'
import AppUpdaterProvider from 'Data/Providers/AppUpdaterProvider'
import SettingsProvider from 'Data/Providers/SettingsProvider'

import OnlyIf from 'Elements/OnlyIf'
import GanacheLogo from 'Resources/logo.png'

import Styles from './AppUpdateScreen.css'

class AppUpdateScreen extends Component {
  constructor () {
    super()
    this.state = {
      version: '0.0.1',
      loadingScreenFinished: false,
      downloadingUpdate: false
    }
  }

  componentDidMount () {
    this.setState({ version: app.getVersion() })
  }

  componentWillReceiveProps (nextProps) {
    const { appUpdater } = nextProps

    const firstRunScreen = this.props.settings.firstRun

    if (
      appUpdater.haveLatestVersion &&
      !this.props.appUpdater.haveLatestVersion
    ) {
      this.setState({ loadingScreenFinished: true })
      setTimeout(() => {
        firstRunScreen
          ? hashHistory.push('/first_run')
          : hashHistory.push('/config')
      }, 4000)
    }

    if (
      appUpdater.updateError !== false &&
      this.props.appUpdater.updateError === false
    ) {
      this.setState({ loadingScreenFinished: true })
      setTimeout(() => {
        firstRunScreen
          ? hashHistory.push('/first_run')
          : hashHistory.push('/config')
      }, 4000)
    }
  }

  _updateNow = () => {
    this.props.appDownloadAndApplyUpdate()
    this.setState({
      downloadingUpdate: true
    })
  }

  _updateLater = () => {
    const firstRunScreen = this.props.settings.firstRun
    this.setState({ loadingScreenFinished: true })
    firstRunScreen
    ? hashHistory.push('/first_run')
    : hashHistory.push('/config')
  }

  render () {
    const styles = `${Styles.LoadingScreen} ${this.state.loadingScreenFinished
      ? Styles.FadeOutLoadingScreen
      : ''}`

    const elementStyles = className =>
      `${className} ${this.state.loadingScreenFinished
        ? Styles.FadeOutElement
        : ''}`

    return (
      <div className={styles}>
        <div className={Styles.Wrapper}>
          <div className={elementStyles(Styles.Logo)}>
            <img src={GanacheLogo} width={'128px'} height={'128px'} />
          </div>
          <h4 className={elementStyles('')}>
            <strong>
              GANACHE<sup>β</sup>
            </strong>
            <div className={elementStyles(Styles.GanacheVersion)}>
              v{this.state.version}
            </div>
          </h4>
          <OnlyIf test={this.props.appUpdater.checkingForUpdate}>
            <p className={elementStyles(Styles.InitialUpdateNotice)}>
              Checking for Ganache Updates...
            </p>
          </OnlyIf>
          <OnlyIf test={this.props.appUpdater.updateAvailable && !this.state.downloadingUpdate}>
            <div className={elementStyles(Styles.UpdateAvailable)}>
              A Ganache update is available!

              <button onClick={this._updateNow}>Update Now</button>
              <button onClick={this._updateLater}>Update Later</button>
            </div>
          </OnlyIf>
          <OnlyIf test={this.state.downloadingUpdate}>
            <div className={elementStyles(Styles.DownloadingUpdate)}>
             The update is downloading. Ganache will automatically restart.
            </div>
          </OnlyIf>
          <OnlyIf test={this.props.appUpdater.haveLatestVersion}>
            <p className={elementStyles(Styles.UpdateNotice)}>
              You have the most up-to-date version of Ganache.
            </p>
          </OnlyIf>
          <OnlyIf test={this.props.appUpdater.downloadingUpdate !== false}>
            <p className={elementStyles(Styles.UpdateNotice)}>
              Downloading Ganache update...
            </p>
          </OnlyIf>
          <OnlyIf test={this.props.appUpdater.updateError}>
            <p className={elementStyles(Styles.UpdateNotice)}>
              Updates not available right now.
            </p>
          </OnlyIf>
          <OnlyIf test={this.props.appUpdater.updateDownloaded}>
            <p className={elementStyles(Styles.UpdateNotice)}>
              Ganache update downloaded. Restarting in 5s...
            </p>
          </OnlyIf>
        </div>
      </div>
    )
  }
}

export default SettingsProvider(
  AppUpdaterProvider(TestRPCProvider(AppUpdateScreen))
)
