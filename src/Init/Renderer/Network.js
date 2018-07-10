import { ipcRenderer } from 'electron'

import {
  SET_INTERFACES,
  setInterfaces
} from '../../Actions/Network'

export function initNetwork(store) {
  ipcRenderer.on(SET_INTERFACES, (event, interfaces) => {
    store.dispatch(setInterfaces(interfaces))
  })
}
