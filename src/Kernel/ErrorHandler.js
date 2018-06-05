
import * as Core from '../Actions/Core'
import * as Settings from '../Actions/Settings'

export function handleError(store, error) {
  let showModal = false
  let activeConfigTab = ""

  if (typeof error === "object" && "code" in error) {
    switch (error.code) {
      case "EADDRINUSE":
      case "EACESS":
        store.dispatch(Settings.setSettingError("server.port", "The port is used by another application; please change it"))
        activeConfigTab = "server"
        break
      case "EADDRNOTAVAIL":
        store.dispatch(Settings.setSettingError("server.hostname", "The hostname is not local address; only use hostnames/IPs associated with this machine"))
        activeConfigTab = "server"
        break
      case "CUSTOMERROR":
        store.dispatch(Settings.setSettingError(error.key, error.value))
        activeConfigTab = error.tab
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
    store.dispatch(Settings.showConfigScreen(activeConfigTab))
  }
}