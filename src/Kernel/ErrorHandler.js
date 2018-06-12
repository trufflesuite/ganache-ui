
import * as Core from '../Actions/Core'
import * as Settings from '../Actions/Settings'
import {GoogleAnalytics as GA} from '../Services/GoogleAnalytics'

function reportError(action, label) {
  let event = {
    category: "error",
    action
  }

  if (label) {
    event.label = label
  }

  GA.reportEvent(event)
}

export function handleError(store, error) {
  let showModal = false
  let activeConfigTab = ""

  if (typeof error === "object" && "code" in error) {
    switch (error.code) {
      case "EADDRINUSE":
      case "EACESS":
        store.dispatch(Settings.setSettingError("server.port", "The port is used by another application; please change it"))
        activeConfigTab = "server"
        reportError("network", error.code)
        break
      case "EADDRNOTAVAIL":
        store.dispatch(Settings.setSettingError("server.hostname", "The hostname is not local address; only use hostnames/IPs associated with this machine"))
        activeConfigTab = "server"
        reportError("network", error.code)
        break
      case "CUSTOMERROR":
        store.dispatch(Settings.setSettingError(error.key, error.value))
        activeConfigTab = error.tab
        reportError("custom", error.key + " - " + error.value)
        break
      case "CHAINEXIT":
        showModal = true
        reportError("chain-exit", error.exitCode + " - " + error.exitSignal + (error.logError ? (" - " + error.logError) : ""))
        break
      default:
        showModal = true
        reportError("generic", error.code)
        break
    }
  }
  else {
    showModal = true
    reportError("generic", JSON.stringify(error))
  }

  store.dispatch(Core.setSystemError(error, showModal))

  if (!showModal) {
    // show the config screen
    store.dispatch(Settings.showConfigScreen(activeConfigTab))
  }
}