import { ipcRenderer } from 'electron'

import {
  ADD_LOG_LINES,
  addLogLines
} from '../../redux/logs/actions'

export function initLogs(store) {
  ipcRenderer.on(ADD_LOG_LINES, (event, lines) => {
    store.dispatch(addLogLines(lines))
  })
}
