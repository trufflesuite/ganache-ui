const pkg = require('../../package.json')

const getVersion = () => pkg.version

const getPlatform = () => process.env.PLATFORM || process.platform

const relaunch = () => {
  if (process.env.PLATFORM === 'browser') {
    location.reload()
  } else {
    const { remote } = require('electron')
    remote.app.relaunch()
    remote.app.exit()
  }
}

const openExternal = (url) => {
  if (process.env.PLATFORM === 'browser') {
    window.open(url)
  } else {
    require('electron').shell.openExternal(url)
  }
}

const setCookies = (cookies) => {
  if (process.env.PLATFORM === 'browser') {
    // TODO
  } else {
    const ElectronCookies = require('@exponent/electron-cookies')
    ElectronCookies.enable(cookies)
  }
}

export default {
  getVersion,
  getPlatform,
  relaunch,
  openExternal
}
