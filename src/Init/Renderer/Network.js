import { ipcRenderer } from 'electron'

import * as Network from '../../Actions/Network'

export function initNetwork(store) {
  ipcRenderer.on(Network.SET_INTERFACES, (event, interfaces) => {
    store.dispatch(Network.setInterfaces(interfaces))
  })
}
