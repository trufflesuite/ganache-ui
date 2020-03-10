import { ipcRenderer } from "electron";

export function initCorda(store) {
  ipcRenderer.on("sshData", (_event, {node, data}) => {
    store.dispatch({type: "sshData", node, data})
  });
}
