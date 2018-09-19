import { ipcRenderer } from 'electron'

import {
  SET_WORKSPACES,
  SET_CURRENT_WORKSPACE,
  setWorkspaces,
  setCurrentWorkspace
} from '../../common/redux/workspaces/actions'

export function initWorkspaces(store) {
  ipcRenderer.on(SET_WORKSPACES, (event, workspaceNames) => {
    store.dispatch(setWorkspaces(workspaceNames))
  })

  ipcRenderer.on(SET_CURRENT_WORKSPACE, (event, workspace) => {
    store.dispatch(setCurrentWorkspace(workspace))
  })
}
