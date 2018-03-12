/** Handles all app functions for the web target */

const pkg = require('../../../package.json')

const getVersion = () => pkg.version

const getPlatform = () => 'web'

const relaunch = () => window.location.reload()

const openExternal = (url) => window.open(url)

const enableCookies = () => { /* Cookies already work on the web */ }

export default {
  getVersion,
  getPlatform,
  relaunch,
  openExternal,
  enableCookies
}
