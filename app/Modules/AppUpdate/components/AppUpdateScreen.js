import React, {Component} from 'react'
const {app} = require('electron').remote

import { hashHistory } from 'react-router'
import TestRPCProvider from 'Data/Providers/TestRPCProvider'
import AppUpdaterProvider from 'Data/Providers/AppUpdaterProvider'

import OnlyIf from 'Elements/OnlyIf'
import Icon from 'Elements/Icon'
import GanacheLogo from 'Icons/ganache_logo.svg'

import Styles from './AppUpdateScreen.css'

class AppUpdateScreen extends Component {
  constructor () {
    super()
    this.state = {
      version: '0.0.1',
      loadingScreenFinished: false
    }
  }

  componentDidMount () {
    this.setState({version: app.getVersion()})
  }

  componentWillReceiveProps (nextProps) {
    const { appUpdater } = nextProps

    if (appUpdater.haveLatestVersion && !this.props.appUpdater.haveLatestVersion) {
      this.setState({loadingScreenFinished: true})
      setTimeout(() => {
        hashHistory.push('/config')
      }, 4000)
    }

    if (appUpdater.updateError !== false && this.props.appUpdater.updateError === false) {
      this.setState({loadingScreenFinished: true})
      setTimeout(() => {
        hashHistory.push('/config')
      }, 4000)
    }
  }

  render () {
    const styles = `${Styles.LoadingScreen} ${this.state.loadingScreenFinished ? Styles.FadeOutLoadingScreen : ''}`
    const elementStyles = (className) => (`${className} ${this.state.loadingScreenFinished ? Styles.FadeOutElement : ''}`)

    return (
      <div className={styles}>
        <div className={Styles.Wrapper}>
          <div className={elementStyles(Styles.Logo)}>
            <Icon glyph={GanacheLogo} size={128} stroke={0} className={elementStyles('isolate')} />
          </div>
          <h4 className={elementStyles('')}>
            <strong>GANACHE<sup>β</sup></strong>
            <div className={elementStyles(Styles.GanacheVersion)}>v{this.state.version}</div>
          </h4>
          <OnlyIf test={this.props.appUpdater.checkingForUpdate}>
            <p className={elementStyles(Styles.InitialUpdateNotice)}>Checking for Ganache Updates...</p>
          </OnlyIf>
          <OnlyIf test={this.props.appUpdater.haveLatestVersion}>
            <p className={elementStyles(Styles.UpdateNotice)}>You have the most up-to-date version of Ganache.</p>
          </OnlyIf>
          <OnlyIf test={this.props.appUpdater.downloadingUpdate !== false}>
            <p className={elementStyles(Styles.UpdateNotice)}>Downloading Ganahce update...</p>
          </OnlyIf>
          <OnlyIf test={this.props.appUpdater.updateError}>
            <p className={elementStyles(Styles.UpdateNotice)}>Can't contact the Update server. Please try again later.</p>
          </OnlyIf>
          <OnlyIf test={this.props.appUpdater.updateDownloaded}>
            <p className={elementStyles(Styles.UpdateNotice)}>Ganache update downloaded. Restarting in 5s...</p>
          </OnlyIf>
        </div>
      </div>
    )
  }
}

export default AppUpdaterProvider(TestRPCProvider(AppUpdateScreen))
