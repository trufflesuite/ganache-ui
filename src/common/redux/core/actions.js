import { push } from "connected-react-router";
import { ipcRenderer } from "electron";

import {
  web3CleanUpHelper,
} from "../../../integrations/ethereum/common/redux/web3/helpers/Web3ActionCreator";

const prefix = "CORE";

const cleanupWorkspace = function(dispatch, getState) {
  web3CleanUpHelper(dispatch, getState);

  dispatch(push("/loader"));

  // Dispatch REQUEST_SERVER_RESTART to the store
  // This will clear all state.
  dispatch({ type: REQUEST_SERVER_RESTART });
};

export const SET_SERVER_STARTED = `${prefix}/SET_SERVER_STARTED`;
export function setServerStarted() {
  return { type: SET_SERVER_STARTED };
}

export const REQUEST_SERVER_RESTART = `${prefix}/REQUEST_SERVER_RESTART`;
export function requestServerRestart() {
  return function(dispatch, getState) {
    // Fire off the restart request.
    cleanupWorkspace(dispatch, getState);
    ipcRenderer.send(REQUEST_SERVER_RESTART);
  };
}

export const SHOW_TITLE_SCREEN = `${prefix}/SHOW_TITLE_SCREEN`;
export function showTitleScreen() {
  return function(dispatch) {
    dispatch(push("/title"));
  };
}

export const SHOW_HOME_SCREEN = `${prefix}/SHOW_HOME_SCREEN`;
export function showHomeScreen() {
  return function(dispatch) {
    dispatch(push("/home"));
  };
}

export const SET_SYSTEM_ERROR = `${prefix}/SET_SYSTEM_ERROR`;
export const setSystemError = function(error, showBugModal, category, detail) {
  return { type: SET_SYSTEM_ERROR, error, showBugModal, category, detail };
};

export const SET_MODAL_ERROR = `${prefix}/SET_MODAL_ERROR`;
export const setModalError = function(error) {
  return { type: SET_MODAL_ERROR, error };
};

export const DISMISS_MODAL_ERROR = `${prefix}/DISMISS_MODAL_ERROR`;
export const dismissModalError = function() {
  return { type: DISMISS_MODAL_ERROR };
};

export const DISMISS_BUG_MODAL = `${prefix}/DISMISS_BUG_MODAL`;
export const dismissBugModal = function() {
  return { type: DISMISS_BUG_MODAL };
};

export const SET_PROGRESS = `${prefix}/PROGRESS`;
export const setProgress = function(message) {
  return { type: SET_PROGRESS, message };
};

