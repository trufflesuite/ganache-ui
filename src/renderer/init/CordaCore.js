import { ipcRenderer } from "electron";
import { REFRESH_CORDAPP } from "../../common/redux/corda-core/actions";

export function initCordaCore(store) {
  ipcRenderer.on(REFRESH_CORDAPP, (_event, data) => {
    store.dispatch(data);
  });
}
