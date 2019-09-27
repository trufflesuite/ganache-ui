import { setSystemError, setModalError } from "../../common/redux/core/actions";

import {
  setSettingError,
  showConfigScreen,
  setStartupMode,
  STARTUP_MODE,
} from "../../common/redux/config/actions";

export function handleError(store, error) {
  let showBugModal = false;
  let activeConfigTab = "";
  let category = "generic";
  let detail = "";

  if (typeof error === "object" && "code" in error) {
    switch (error.code) {
      case "PROJECTERROR":
        store.dispatch(setSettingError("workspace.project", error));
        activeConfigTab = "workspace";
        category = "project";
        detail = error.code;
        break;
      case "EADDRINUSE":
      case "EACESS":
      case "EACCES":
        store.dispatch(
          setSettingError(
            "workspace.server.port",
            "The port is used by another application; please change it",
          ),
        );
        activeConfigTab = "server";
        category = "network";
        detail = error.code;
        break;
      case "EADDRNOTAVAIL":
        store.dispatch(
          setSettingError(
            "workspace.server.hostname",
            "The hostname is not local address; only use hostnames/IPs associated with this machine",
          ),
        );
        activeConfigTab = "server";
        category = "network";
        detail = error.code;
        break;
      case "CUSTOMERROR":
        store.dispatch(setSettingError(error.key, error.value));
        store.dispatch(setStartupMode(STARTUP_MODE.NEW_WORKSPACE));
        activeConfigTab = error.tab;
        category = "custom";
        detail = error.key + " - " + error.value;
        break;
      case "MODALERROR":
        store.dispatch(setModalError(error));
        return;
      default:
        showBugModal = true;
        category = "generic";
        detail = error.code;
        break;
    }
  } else {
    showBugModal = true;
    category = "generic";
    detail = JSON.stringify(error);
  }

  store.dispatch(setSystemError(error, showBugModal, category, detail));

  if (!showBugModal) {
    // show the config screen
    store.dispatch(showConfigScreen(activeConfigTab));
  }
}
