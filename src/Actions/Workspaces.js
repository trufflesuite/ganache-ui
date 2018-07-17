import {ipcRenderer } from 'electron'

import { web3CleanUpHelper } from './helpers/Web3ActionCreator'
import { REQUEST_SERVER_RESTART, showTitleScreen } from './Core'
import { DEFAULT_WORKSPACE_NAME } from '../Services/Settings/WorkspaceSettings'

const prefix = 'WORKSPACES'

const cleanupWorkspace = function(dispatch, getState) {
  web3CleanUpHelper(dispatch, getState)

  dispatch(showTitleScreen())

  // Dispatch REQUEST_SERVER_RESTART to the store
  // This will clear all state.
  dispatch({type: REQUEST_SERVER_RESTART})
}

export const SET_WORKSPACES = `${prefix}/SET_WORKSPACES`
export const setWorkspaces = function(workspaces) {
  return {type: SET_WORKSPACES, workspaces}
}

export const CLOSE_WORKSPACE = `${prefix}/CLOSE_WORKSPACE`
export const closeWorkspace = function() {
  return function(dispatch, getState) {
    cleanupWorkspace(dispatch, getState)

    dispatch({type: CLOSE_WORKSPACE})
    ipcRenderer.send(CLOSE_WORKSPACE)
  }
}

export const OPEN_WORKSPACE = `${prefix}/OPEN_WORKSPACE`
export const openWorkspace = function(name) {
  return function(dispatch, getState) {
    dispatch({type: OPEN_WORKSPACE, name})
    ipcRenderer.send(OPEN_WORKSPACE, name)
  }
}

export const openDefaultWorkspace = function() {
  return function(dispatch, getState) {
    dispatch({type: OPEN_WORKSPACE, DEFAULT_WORKSPACE_NAME})
    ipcRenderer.send(OPEN_WORKSPACE, DEFAULT_WORKSPACE_NAME)
  }
}

export const SAVE_WORKSPACE = `${prefix}/SAVE_WORKSPACE`
export const saveWorkspace = function(name) {
  return function(dispatch, getState) {
    cleanupWorkspace(dispatch, getState)

    dispatch({type: SAVE_WORKSPACE, name})
    ipcRenderer.send(SAVE_WORKSPACE, name)
  }
}