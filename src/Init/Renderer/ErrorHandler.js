
import { setSystemError } from '../../Actions/Core'

import {
  setSettingError,
  showConfigScreen
} from '../../Actions/Config'

export function handleError(store, error) {
  let showBugModal = false
  let activeConfigTab = ""
  let category = "generic"
  let detail = ""

  if (typeof error === "object" && "code" in error) {
    switch (error.code) {
      case "EADDRINUSE":
      case "EACESS":
        store.dispatch(setSettingError("server.port", "The port is used by another application; please change it"))
        activeConfigTab = "server"
        category = "network"
        detail = error.code
        break
      case "EADDRNOTAVAIL":
        store.dispatch(setSettingError("server.hostname", "The hostname is not local address; only use hostnames/IPs associated with this machine"))
        activeConfigTab = "server"
        category = "network"
        detail = error.code
        break
      case "CUSTOMERROR":
        store.dispatch(setSettingError(error.key, error.value))
        activeConfigTab = error.tab
        category = "custom"
        detail = error.key + " - " + error.value
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

  store.dispatch(setSystemError(error, showBugModal, category, detail))

  if (!showBugModal) {
    // show the config screen
    store.dispatch(showConfigScreen(activeConfigTab))
  }
}