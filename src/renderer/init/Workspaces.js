import { ipcRenderer } from 'electron'

import {
  SET_WORKSPACES,
  SET_CURRENT_WORKSPACE,
  CONTRACT_DEPLOYED,
  CONTRACT_TRANSACTION,
  CONTRACT_EVENT,
  setWorkspaces,
  setCurrentWorkspace,
  contractDeployed,
  contractTransaction,
  contractEvent
} from '../../common/redux/workspaces/actions'

export function initWorkspaces(store) {
  ipcRenderer.on(SET_WORKSPACES, (event, workspaceNames) => {
    store.dispatch(setWorkspaces(workspaceNames))
  })

  ipcRenderer.on(SET_CURRENT_WORKSPACE, (event, workspace) => {
    store.dispatch(setCurrentWorkspace(workspace))
  })

  ipcRenderer.on(CONTRACT_DEPLOYED, (event, data) => {
    store.dispatch(contractDeployed(data))
  })

  ipcRenderer.on(CONTRACT_TRANSACTION, (event, data) => {
    store.dispatch(contractTransaction(data))
  })

  ipcRenderer.on(CONTRACT_EVENT, (event, data) => {
    store.dispatch(contractEvent(data))
  })
}