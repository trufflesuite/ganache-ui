
import * as Core from '../Actions/Core'
import * as Settings from '../Actions/Settings'

export function handleError(store, error) {
  let showModal = false

  if ("code" in error) {
    switch (error.code) {
      case "EADDRINUSE":
      case "EACESS":
        store.dispatch(Settings.setSettingError("server.port", "The port is used by another application; please change it"))
        break
      case "EADDRNOTAVAIL":
        store.dispatch(Settings.setSettingError("server.hostname", "The hostname is not local address; only use hostnames/IPs associated with this machine"))
        break
      default:
        showModal = true
        break
    }
  }
  else {
    showModal = true
  }

  store.dispatch(Core.setSystemError(error, showModal))

  if (!showModal) {
    // show the config screen
    store.dispatch(Settings.showConfigScreen())
  }
}