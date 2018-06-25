
import * as Core from '../Actions/Core'
import * as Config from '../Actions/Config'

export function handleError(store, error) {
  let showBugModal = false
  let activeConfigTab = ""
  let category = "generic"
  let detail = ""

  if (typeof error === "object" && "code" in error) {
    switch (error.code) {
      case "EADDRINUSE":
      case "EACESS":
        store.dispatch(Config.setSettingError("server.port", "The port is used by another application; please change it"))
        activeConfigTab = "server"
        category = "network"
        detail = error.code
        break
      case "EADDRNOTAVAIL":
        store.dispatch(Config.setSettingError("server.hostname", "The hostname is not local address; only use hostnames/IPs associated with this machine"))
        activeConfigTab = "server"
        category = "network"
        detail = error.code
        break
      case "CUSTOMERROR":
        store.dispatch(Config.setSettingError(error.key, error.value))
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
        showBugModal = true
        category = "generic"
        detail = error.code
        break
    }
  }
  else {
    showBugModal = true
    category = "generic"
    detail = JSON.stringify(error)
  }

  store.dispatch(Core.setSystemError(error, showBugModal, category, detail))

  if (!showBugModal) {
    // show the config screen
    store.dispatch(Config.showConfigScreen(activeConfigTab))
  }
}