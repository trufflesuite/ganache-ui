
import { setSystemError } from '../../Actions/Core'

import {
  setSettingError,
  showConfigScreen
} from '../../Actions/Config'

export function handleError(store, error) {
  let showBugModal = false
  let activeConfigTab = ""

  if (typeof error === "object" && "code" in error) {
    switch (error.code) {
      case "EADDRINUSE":
      case "EACESS":
        store.dispatch(setSettingError("server.port", "The port is used by another application; please change it"))
        activeConfigTab = "server"
        break
      case "EADDRNOTAVAIL":
        store.dispatch(setSettingError("server.hostname", "The hostname is not local address; only use hostnames/IPs associated with this machine"))
        activeConfigTab = "server"
        break
      case "CUSTOMERROR":
        store.dispatch(setSettingError(error.key, error.value))
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

  store.dispatch(setSystemError(error, showBugModal))

  if (!showBugModal) {
    // show the config screen
    store.dispatch(showConfigScreen(activeConfigTab))
  }
}