import { ipcRenderer } from 'electron'

import * as Logs from '../../Actions/Logs'

export function initLogs(store) {
  ipcRenderer.on(Logs.ADD_LOG_LINES, (event, lines) => {
    store.dispatch(Logs.addLogLines(lines))
  })
}
