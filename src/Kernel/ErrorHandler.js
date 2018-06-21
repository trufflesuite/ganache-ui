
import * as Core from '../Actions/Core'
import * as Settings from '../Actions/Settings'

export function handleError(store, error) {
  let showBugModal = false
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
      showBugModal = true
        break
    }
  }
  else {
    showBugModal = true
  }

  store.dispatch(Core.setSystemError(error, showBugModal))

  if (!showBugModal) {
    // show the config screen
    store.dispatch(Settings.showConfigScreen(activeConfigTab))
  }
}