const pkg = require('../../package.json')

const getVersion = () => pkg.version

const getPlatform = () => process.env.PLATFORM || process.platform

const relaunch = () => {
  if (process.env.WEBPACK_TARGET === 'web') {
    window.location.reload()
  } else {
    const { remote } = require('electron')
    remote.app.relaunch()
    remote.app.exit()
  }
}

const openExternal = (url) => {
  if (process.env.WEBPACK_TARGET === 'web') {
    window.open(url)
  } else {
    require('electron').shell.openExternal(url)
  }
}

const enableCookies = () => {
  if (process.env.WEBPACK_TARGET !== 'web') {
    const ElectronCookies = require('@exponent/electron-cookies')
    ElectronCookies.enable({
      origin: 'http://truffleframework.com/ganache'
    })
  }
}

export default {
  getVersion,
  getPlatform,
  relaunch,
  openExternal,
  enableCookies
}
