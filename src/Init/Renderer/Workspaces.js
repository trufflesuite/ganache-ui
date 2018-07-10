import { ipcRenderer } from 'electron'

import {
  SET_WORKSPACES,
  setWorkspaces
} from '../../Actions/Workspaces'

export function initWorkspaces(store) {
  ipcRenderer.on(SET_WORKSPACES, (event, workspaceNames) => {
    store.dispatch(setWorkspaces(workspaceNames))
  })
}
