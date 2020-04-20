import { ipcRenderer } from "electron";
import { SSH_DATA, CLEAR_TERM } from "../../common/redux/cordashell/actions";

export function initCorda(store) {
  ipcRenderer.on(SSH_DATA, (_event, {node, data}) => {
    store.dispatch({type: SSH_DATA, node, data})
  });
  ipcRenderer.on(CLEAR_TERM, (_event, {node}) => {
    store.dispatch({type: CLEAR_TERM, node})
  });
}
