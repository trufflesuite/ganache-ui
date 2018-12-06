import { ipcRenderer } from 'electron'

import { web3Request, web3ActionCreator } from '../web3/helpers/Web3ActionCreator'

import { GET_DECODED_EVENT } from "../events/actions"

const prefix = 'TRANSACTIONS'
const PAGE_SIZE = 10

export const CLEAR_TRANSACTIONS_IN_VIEW = `${prefix}/CLEAR_TRANSACTIONS_IN_VIEW`
export const clearTransactionsInView = function() {
  return { type: CLEAR_TRANSACTIONS_IN_VIEW, transactions: [] }
}

export const requestPage = function(startBlockNumber, endBlockNumber) {
  endBlockNumber = endBlockNumber || 0
  return function(dispatch, getState) {
    if (startBlockNumber == null) {
      startBlockNumber = getState().core.latestBlock
    }

    let earliestBlockToRequest = Math.max(startBlockNumber - PAGE_SIZE, endBlockNumber)
    let currentBlock = startBlockNumber
    while (currentBlock >= earliestBlockToRequest) {
      dispatch(getTransactionsForBlock(currentBlock))
      currentBlock -= 1
    }
  }  
}

// The "next" page is the next set of blocks, from the last requested down to 0
export const requestNextPage = function() {
  
  return function(dispatch, getState) {
    var blocksRequested = Object.keys(getState().transactions.blocksRequested)
    var earliestBlockRequested = Math.min.apply(Math, blocksRequested)
    dispatch(requestPage(earliestBlockRequested - 1))
  }
}

export const requestPreviousPage = function() {
  return function(dispatch, getState) {
    var blocksRequested = Object.keys(getState().transactions.blocksRequested)

    if (blocksRequested.length == 0) {
      return dispatch(requestPage(getState().core.latestBlock))
    }

    var latestBlockRequested = Math.max.apply(Math, blocksRequested)
    var latestBlock = getState().core.latestBlock
  
    var startBlock = Math.min(latestBlock, latestBlockRequested + PAGE_SIZE)
    var endBlock = latestBlockRequested + 1

    dispatch(requestPage(startBlock, endBlock))
  }
}

export const ADD_RECEIPTS = `${prefix}/ADD_RECEIPTS`
export const getReceipts = function(transactions) {
  return async function(dispatch, getState) {
    let web3Instance = getState().web3.web3Instance

    return await Promise.all(
      transactions.map(tx => {
        return web3Request("getTransactionReceipt", [tx.hash], web3Instance)
      })
    ).then(receipts => {
      dispatch({type: ADD_RECEIPTS, receipts })
    })
  }
}

export const SET_BLOCK_REQUESTED = `${prefix}/SET_BLOCK_REQUESTED`
export const ADD_TRANSACTIONS_TO_VIEW = `${prefix}/ADD_TRANSACTIONS_TO_VIEW`
export const getTransactionsForBlock = function(number) {
  return async function(dispatch, getState) {
    let requested = getState().transactions.blocksRequested

    // If it's already requested, bail
    if (requested[number] === true) {
      return
    }

    let web3Instance = getState().web3.web3Instance

    // It's not requested? Let's get the drop on it so 
    // no other process requests it
    dispatch({type: SET_BLOCK_REQUESTED, number })

    // Now request the block and receipts for all its transactions
    let block = await web3Request("getBlock", [number, true], web3Instance)

    if (block.transactions.length == 0) {
      return
    }

    dispatch(getReceipts(block.transactions))
    dispatch({type: ADD_TRANSACTIONS_TO_VIEW, transactions: block.transactions })
  }
}

export const GET_DECODED_TRANSACTION_INPUT = `${prefix}/GET_DECODED_TRANSACTION_INPUT`
export const SET_CURRENT_TRANSACTION_SHOWN = `${prefix}/SET_CURRENT_TRANSACTION_SHOWN`
export const showTransaction = function(hash) {
  return async function(dispatch, getState) {
    let web3Instance = getState().web3.web3Instance
    let transaction = await web3Request("getTransaction", [hash], web3Instance)
    let receipt = await web3Request("getTransactionReceipt", [hash], web3Instance)
    let events = []
    let decodedData = null

    let contract
    let projectIndex
    const state = getState()
    for (let i = 0; i < state.workspaces.current.projects.length; i++) {
      const project = state.workspaces.current.projects[i]
      for (let j = 0; j < project.contracts.length; j++) {
        const tempContract = project.contracts[j]
        if (tempContract.address && tempContract.address === transaction.to) {
          contract = tempContract
          projectIndex = i
          break
        }
      }

      if (contract) {
        break
      }
    }

    // I was going to use the blocks inView here by just dispatching `requestPage`
    //   from the blocks redux, but that gets cleared and doesnt work well, so I'm
    //   doing it the dirty and brute force way
    let blockTimestamps = {}

    // TODO: This is shared code in redux/workspaces/actions.js
    for (let j = 0; j < receipt.logs.length; j++) {
      const log = receipt.logs[j]

      if (typeof blockTimestamps[log.blockNumber] === "undefined") {
        const block = await web3ActionCreator(dispatch, getState, "getBlock", [log.blockNumber, false])
        blockTimestamps[log.blockNumber] = block ? block.timestamp : null
      }
      log.timestamp = blockTimestamps[log.blockNumber]

      events.push({
        transactionHash: transaction.hash,
        logIndex: log.logIndex,
        log: log,
        decodedLog: null
      })
    }

    if (contract) {
      for (let j = 0; j < events.length; j++) {
        events[j].decodedLog = await new Promise((resolve, reject) => {
          // TODO: there's a better way to do this to not have to send `contract` and `contracts` every time
          ipcRenderer.once(GET_DECODED_EVENT, (event, decodedLog) => {
            resolve(decodedLog)
          })
          ipcRenderer.send(GET_DECODED_EVENT, contract, state.workspaces.current.projects[projectIndex].contracts, events[j].log)
        })
      }

      decodedData = await new Promise((resolve, reject) => {
        // TODO: there's a better way to do this to not have to send `contract` and `contracts` every time
        ipcRenderer.once(GET_DECODED_TRANSACTION_INPUT, (event, decodedData) => {
          resolve(decodedData)
        })
        ipcRenderer.send(GET_DECODED_TRANSACTION_INPUT, contract, state.workspaces.current.projects[projectIndex].contracts, transaction)
      })
    }

    dispatch({type: SET_CURRENT_TRANSACTION_SHOWN, transaction, receipt, events, decodedData, contract})
  }
}
export const clearTransactionShown = function() {
  return {type: SET_CURRENT_TRANSACTION_SHOWN, transaction: null, receipt: null}
}
