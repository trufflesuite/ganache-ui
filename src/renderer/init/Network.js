import { ipcRenderer } from "electron";

import {
  SET_INTERFACES,
  setInterfaces,
} from "../../common/redux/network/actions";

export function initNetwork(store) {
  ipcRenderer.on(SET_INTERFACES, (event, interfaces) => {
    store.dispatch(setInterfaces(interfaces));
  });
}
