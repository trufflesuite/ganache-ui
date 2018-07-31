import { ipcRenderer } from 'electron'

import {
  ADD_LOG_LINES,
  addLogLines
} from '../../Actions/Logs'

export function initLogs(store) {
  ipcRenderer.on(ADD_LOG_LINES, (event, lines) => {
    store.dispatch(addLogLines(lines))
  })
}
