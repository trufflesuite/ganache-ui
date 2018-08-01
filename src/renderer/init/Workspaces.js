import { ipcRenderer } from 'electron'

import {
  SET_WORKSPACES,
  setWorkspaces
} from '../../redux/workspaces/actions'

export function initWorkspaces(store) {
  ipcRenderer.on(SET_WORKSPACES, (event, workspaceNames) => {
    store.dispatch(setWorkspaces(workspaceNames))
  })
}
