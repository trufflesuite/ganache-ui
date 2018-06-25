
import * as Core from '../Actions/Core'
import * as Settings from '../Actions/Settings'

export function handleError(store, error) {
  let showModal = false
  let activeConfigTab = ""
  let category = "generic"
  let detail = ""

  if (typeof error === "object" && "code" in error) {
    switch (error.code) {
      case "EADDRINUSE":
      case "EACESS":
        store.dispatch(Settings.setSettingError("server.port", "The port is used by another application; please change it"))
        activeConfigTab = "server"
        category = "network"
        detail = error.code
        break
      case "EADDRNOTAVAIL":
        store.dispatch(Settings.setSettingError("server.hostname", "The hostname is not local address; only use hostnames/IPs associated with this machine"))
        activeConfigTab = "server"
        category = "network"
        detail = error.code
        break
      case "CUSTOMERROR":
        store.dispatch(Settings.setSettingError(error.key, error.value))
        activeConfigTab = error.tab
        category = "custom"
        detail = error.key + " - " + error.value
        break
      case "CHAINEXIT":
        showModal = true
        category = "chain-exit"
        detail = error.exitCode + " - " + error.exitSignal + (error.logError ? (" - " + error.logError) : "")
        break
      default:
        showModal = true
        category = "generic"
        detail = error.code
        break
    }
  }
  else {
    showModal = true
    category = "generic"
    detail = JSON.stringify(error)
  }

  store.dispatch(Core.setSystemError(error, showModal, category, detail))

  if (!showModal) {
    // show the config screen
    store.dispatch(Settings.showConfigScreen(activeConfigTab))
  }
}