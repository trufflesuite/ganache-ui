/** Handles all app functions for the electron-renderer target */

import { remote, shell } from 'electron'
import ElectronCookies from '@exponent/electron-cookies'

const getVersion = () => remote.app.getVersion()

const getPlatform = () => process.platform

const relaunch = () => {
  remote.app.relaunch()
  remote.app.exit()
}

const openExternal = shell.openExternal.bind(shell)

const enableCookies = () => ElectronCookies.enable({
  origin: 'http://truffleframework.com/ganache'
})

export default {
  getVersion,
  getPlatform,
  relaunch,
  openExternal,
  enableCookies
}
