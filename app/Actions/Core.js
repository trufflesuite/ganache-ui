import web3ActionCreator from './helpers/Web3ActionCreator'
import { getAccounts } from './Accounts'

const prefix = 'CORE'

export const SET_SERVER_STARTED = `${prefix}/SET_SERVER_STARTED`
export function setServerStarted() {
  return { type: SET_SERVER_STARTED }
}

export const SET_MNEMONIC_AND_HD_PATH = `${prefix}/SET_MNEMONIC_AND_HD_PATH`
export function setMnemonicAndHDPath(mnemonic, hdPath) {
  return { type: SET_MNEMONIC_AND_HD_PATH, mnemonic, hdPath }
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
  return web3ActionCreator("getBlock", [0], (block, dispatch, getState) => {
    var currentGasLimit = getState().core.gasLimit

    var gasLimit = block.gasLimit.toString()

    if (gasLimit != currentGasLimit) {
      dispatch({ type: SET_GAS_LIMIT, gasLimit })
    }
  })
}

export const GET_BLOCK_NUMBER = `${prefix}/GET_BLOCK_NUMBER`
export const getBlockNumber = function() {
  return web3ActionCreator("getBlockNumber", (number, dispatch, getState) => {
    var currentBlockNumber = getState().core.latestBlock

    if (number != currentBlockNumber) {
      dispatch({ type: GET_BLOCK_NUMBER, number })

      // Refresh our accounts if the block changed.
      dispatch(getAccounts())
    }
  })
}

export const GET_BLOCK = `${prefix}/GET_BLOCK`
export const getBlock = function(numberOrHash) {
  return web3ActionCreator("getBlock", [numberOrHash, true], (block, dispatch, getState) => {
    dispatch({type: GET_BLOCK, block })
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
