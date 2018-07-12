import {ipcRenderer } from 'electron'

import { web3CleanUpHelper } from './helpers/Web3ActionCreator'
import { REQUEST_SERVER_RESTART, showTitleScreen } from './Core'

const prefix = 'WORKSPACES'

export const SET_WORKSPACES = `${prefix}/SET_WORKSPACES`
export const setWorkspaces = function(workspaces) {
  return {type: SET_WORKSPACES, workspaces}
}

export const CLOSE_WORKSPACE = `${prefix}/CLOSE_WORKSPACE`
export const closeWorkspace = function() {
  return function(dispatch, getState) {
    web3CleanUpHelper(dispatch, getState)

    dispatch(showTitleScreen())

    // Dispatch REQUEST_SERVER_RESTART to the store
    // This will clear all state.
    dispatch({type: REQUEST_SERVER_RESTART})

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
