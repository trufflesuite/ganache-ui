import { ipcRenderer } from "electron";

import {
  setNodeStarted,
  setNodeStopped,
  setNodeStarting
} from "../../common/redux/config/actions";

export function initCordaShutdown(store) {
  ipcRenderer.on("NODE_STARTED", (_event, safeName) => {
    store.dispatch(setNodeStarted(safeName));
  });

  ipcRenderer.on("NODE_STOPPED", (_event, safeName) => {
    store.dispatch(setNodeStopped(safeName));
  });

  ipcRenderer.on("NODE_STARTING", (_event, safeName) => {
    store.dispatch(setNodeStarting(safeName));
  });
}