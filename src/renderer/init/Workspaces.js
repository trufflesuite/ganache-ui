import { ipcRenderer } from "electron";

import {
  SET_WORKSPACES,
  SET_CURRENT_WORKSPACE,
  setWorkspaces,
  setCurrentWorkspace
} from "../../common/redux/workspaces/actions";

import {
    PROJECT_UPDATED,
    CONTRACT_DEPLOYED,
    CONTRACT_EVENT,
    CONTRACT_TRANSACTION,
    contractDeployed,
    contractTransaction,
    contractEvent,
    projectUpdated
} from "../../integrations/ethereum/common/redux/workspaces/actions";

export function initWorkspaces(store) {
  ipcRenderer.on(SET_WORKSPACES, (event, workspaceNames) => {
    store.dispatch(setWorkspaces(workspaceNames));
  });

  ipcRenderer.on(SET_CURRENT_WORKSPACE, (event, workspace, contractCache) => {
    store.dispatch(setCurrentWorkspace(workspace, contractCache));
  });

  ipcRenderer.on(CONTRACT_DEPLOYED, (event, data) => {
    store.dispatch(contractDeployed(data));
  });

  ipcRenderer.on(CONTRACT_TRANSACTION, (event, data) => {
    store.dispatch(contractTransaction(data));
  });

  ipcRenderer.on(CONTRACT_EVENT, (event, data) => {
    store.dispatch(contractEvent(data));
  });

  ipcRenderer.on(PROJECT_UPDATED, (event, data) => {
    store.dispatch(projectUpdated(data));
  });
}
