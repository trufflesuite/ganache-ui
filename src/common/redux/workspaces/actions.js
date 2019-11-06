import { ipcRenderer } from "electron";
import { push } from "react-router-redux";

import {
  web3CleanUpHelper,
} from "../../../integrations/ethereum/common/redux/web3/helpers/Web3ActionCreator";
import { REQUEST_SERVER_RESTART } from "../core/actions";

const prefix = "WORKSPACES";

const cleanupWorkspace = function(dispatch, getState) {
  web3CleanUpHelper(dispatch, getState);

  dispatch(push("/loader"));

  // Dispatch REQUEST_SERVER_RESTART to the store
  // This will clear all state.
  dispatch({ type: REQUEST_SERVER_RESTART });
};

export const SET_WORKSPACES = `${prefix}/SET_WORKSPACES`;
export const setWorkspaces = function(workspaces) {
  return { type: SET_WORKSPACES, workspaces };
};

export const CLOSE_WORKSPACE = `${prefix}/CLOSE_WORKSPACE`;
export const closeWorkspace = function() {
  return function(dispatch, getState) {
    cleanupWorkspace(dispatch, getState);

    dispatch({ type: CLOSE_WORKSPACE });
    ipcRenderer.send(CLOSE_WORKSPACE);
  };
};

export const OPEN_WORKSPACE = `${prefix}/OPEN_WORKSPACE`;
export const openWorkspace = function(name, flavor = "ethereum") {
  return function(dispatch) {
    dispatch(push("/loader"));
    dispatch({ type: OPEN_WORKSPACE, name, flavor});
    ipcRenderer.send(OPEN_WORKSPACE, name, flavor);
  };
};

export const openDefaultWorkspace = function(flavor = "ethereum") {
  return function(dispatch) {
    dispatch(push("/loader"));
    dispatch({ type: OPEN_WORKSPACE, name: null, flavor });
    ipcRenderer.send(OPEN_WORKSPACE, null, flavor);
  };
};

export const OPEN_NEW_WORKSPACE_CONFIG = `${prefix}/OPEN_NEW_WORKSPACE_CONFIG`;
export const openNewWorkspaceConfig = function() {
  return function(dispatch) {
    dispatch(push("/loader"));
    ipcRenderer.send(OPEN_NEW_WORKSPACE_CONFIG);
  };
};

export const SAVE_WORKSPACE = `${prefix}/SAVE_WORKSPACE`;
export const saveWorkspace = function(name) {
  return function(dispatch, getState) {
    const mnemonic = getState().core.mnemonic;

    cleanupWorkspace(dispatch, getState);

    dispatch({ type: SAVE_WORKSPACE, name, mnemonic: mnemonic });

    ipcRenderer.send(SAVE_WORKSPACE, name, mnemonic);
  };
};

export const DELETE_WORKSPACE = `${prefix}/DELETE_WORKSPACE`;
export const deleteWorkspace = function(name) {
  return function(dispatch) {
    dispatch({ type: DELETE_WORKSPACE, name });

    ipcRenderer.send(DELETE_WORKSPACE, name);
  };
};

export const SET_CURRENT_WORKSPACE = `${prefix}/SET_CURRENT_WORKSPACE`;
export const setCurrentWorkspace = function(workspace, contractCache) {
  return { type: SET_CURRENT_WORKSPACE, workspace, contractCache };
};
