import {ipcRenderer } from 'electron'

import { web3CleanUpHelper, web3ActionCreator } from '../web3/helpers/Web3ActionCreator'
import { REQUEST_SERVER_RESTART, showTitleScreen } from '../core/actions'

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
    dispatch({type: OPEN_WORKSPACE, name: null})
    ipcRenderer.send(OPEN_WORKSPACE, null)
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

export const SET_CURRENT_WORKSPACE = `${prefix}/SET_CURRENT_WORKSPACE`
export const setCurrentWorkspace = function(workspace) {
  return {type: SET_CURRENT_WORKSPACE, workspace}
}

export const CONTRACT_DEPLOYED = `${prefix}/CONTRACT_DEPLOYED`
export const contractDeployed = function(data) {
  return {type: CONTRACT_DEPLOYED, data}
}

export const CONTRACT_TRANSACTION = `${prefix}/CONTRACT_TRANSACTION`
export const contractTransaction = function(data) {
  return {type: CONTRACT_TRANSACTION, data}
}

export const CONTRACT_EVENT = `${prefix}/CONTRACT_EVENT`
export const contractEvent = function(data) {
  return {type: CONTRACT_EVENT, data}
}

export const GET_CONTRACT_TRANSACTIONS = `${prefix}/GET_CONTRACT_TRANSACTIONS`
export const getContractTransactions = function(transactions) {
  return async function(dispatch, getState) {
    let shownTransactions = []
    let shownReceipts = {}
    for (let i = 0; i < transactions.length; i++) {
      const transaction = await web3ActionCreator(dispatch, getState, "getTransaction", [transactions[i]])
      shownTransactions.push(transaction)
      const receipt = await web3ActionCreator(dispatch, getState, "getTransactionReceipt", [transactions[i]])
      shownReceipts[transactions[i]] = receipt
    }

    dispatch({ type: GET_CONTRACT_TRANSACTIONS, shownTransactions, shownReceipts })
  }
}

export const CLEAR_SHOWN_CONTRACT = `${prefix}/CLEAR_SHOWN_CONTRACT`
export const clearShownContract = function() {
  return { type: CLEAR_SHOWN_CONTRACT }
}
