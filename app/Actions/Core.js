import { web3ActionCreator } from './helpers/Web3ActionCreator'
import { getAccounts } from './Accounts'
import { push } from 'react-router-redux'
import { ipcRenderer } from 'electron'

const prefix = 'CORE'

export const SET_SERVER_STARTED = `${prefix}/SET_SERVER_STARTED`
export function setServerStarted() {
  return { type: SET_SERVER_STARTED }
}

export const REQUEST_SERVER_RESTART = `${prefix}/REQUEST_SERVER_RESTART`
export function requestServerRestart() {
  return function(dispatch, getState) {
    // Show the title screen
    dispatch(showTitleScreen())

    // Dispatch REQUEST_SERVER_RESTART to the store
    // This will clear all state.
    dispatch({type: REQUEST_SERVER_RESTART})

    // Fire off the restart request.
    ipcRenderer.send(REQUEST_SERVER_RESTART)
  }
}

export const SHOW_TITLE_SCREEN = `${prefix}/SHOW_TITLE_SCREEN`
export function showTitleScreen() {
  return function(dispatch, getState) {
    dispatch(push("/title"))
  }
}

export const SET_KEY_DATA = `${prefix}/SET_KEY_DATA`
export function setKeyData(mnemonic, hdPath, privateKeys) {
  return { type: SET_KEY_DATA, mnemonic, hdPath, privateKeys }
}

export const SET_GAS_PRICE = `${prefix}/SET_GAS_PRICE`
export const getGasPrice = function() {
  return web3ActionCreator("getGasPrice", (gasPrice, dispatch, getState) => {
    var currentPrice = getState().core.gasPrice
    gasPrice = gasPrice.toString(10)

    if (gasPrice != currentPrice) {
      dispatch({ type: SET_GAS_PRICE, gasPrice })
    }
  })
}

export const SET_GAS_LIMIT = `${prefix}/SET_GAS_LIMIT`
export const getGasLimit = function() {
  return web3ActionCreator("getBlock", ["latest"], (block, dispatch, getState) => {
    var currentGasLimit = getState().core.gasLimit

    var gasLimit = block.gasLimit.toString()

    if (gasLimit != currentGasLimit) {
      dispatch({ type: SET_GAS_LIMIT, gasLimit })
    }
  })
}

export const SET_BLOCK_NUMBER = `${prefix}/SET_BLOCK_NUMBER`
export const setBlockNumber = function(number) {
  return function(dispatch, getState) {
    dispatch({ type: SET_BLOCK_NUMBER, number })
    
    // Refresh our accounts if the block changed.
    dispatch(getAccounts())
  }
}

export const GET_BLOCK_NUMBER = `${prefix}/GET_BLOCK_NUMBER`
export const getBlockNumber = function() {
  return web3ActionCreator("getBlockNumber", (number, dispatch, getState) => {
    var currentBlockNumber = getState().core.latestBlock

    if (number != currentBlockNumber) {
      dispatch(setBlockNumber(number))
    }
  })
}

// export const SET_LAST_REQUESTED_BLOCK_NUMBER = `${prefix}/SET_LAST_REQUESTED_BLOCK`
// export function setLastRequestedBlock(number) {
//   return function(dispatch, getState) {
//     let lastRequestedBlock = getState().core.lastRequestedBlock

//     if (number == lastRequestedBlock) {
//       return
//     }

//     dispatch({ type: SET_LAST_REQUESTED_BLOCK_NUMBER, number })

//     // We requested data about a new block; this means one of our accounts
//     // likely made the transactions. Let's update the account data.
//     dispatch(getAccounts())
//   }
// }

// export const processBlocks = function() {
//   return function(dispatch, getState) {
//     var latestBlock = getState().core.latestBlock
//     var lastRequestedBlock = getState().core.lastRequestedBlock

//     if (latestBlock == lastRequestedBlock) {
//       return
//     }

//     while (lastRequestedBlock < latestBlock ) {
//       lastRequestedBlock += 1
//       dispatch(getBlock(lastRequestedBlock))
//     }

//     dispatch(setLastRequestedBlock(lastRequestedBlock))
//   }
// }
