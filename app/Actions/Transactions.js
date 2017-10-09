
import { web3Request, web3ActionCreator } from './helpers/Web3ActionCreator'
import map from 'async/map'

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

export const SET_BLOCK_REQUESTED = `${prefix}/SET_BLOCK_REQUESTED`
export const ADD_TRANSACTIONS_TO_VIEW = `${prefix}/ADD_TRANSACTIONS_TO_VIEW`
export const getTransactionsForBlock = function(number) {
  return function(dispatch, getState) {
    let requested = getState().transactions.blocksRequested

    // If it's already requested, bail
    if (requested[number] === true) {
      return
    }

    let provider = getState().web3.provider

    // It's not requested? Let's get the drop on it so 
    // no other process requests it
    dispatch({type: SET_BLOCK_REQUESTED, number })

    // Now request the block and receipts for all its transactions
    web3Request("getBlock", [number, true], provider, (block) => {
      if (block.transactions.length == 0) {
        return
      }

      map(block.transactions, (tx, done) => {
        web3Request("getTransactionReceipt", [tx.hash], provider, (receipt) => {
          done(null, receipt)
        } )
      }, (err, receipts) => {
        dispatch({type: ADD_TRANSACTIONS_TO_VIEW, transactions: block.transactions, receipts })
      })
    })
  }
}

export const SET_CURRENT_TRANSACTION_SHOWN = `${prefix}/SET_CURRENT_TRANSACTION_SHOWN`
export const showTransaction = function(hash) {
  return function(dispatch, getState) {
    let provider = getState().web3.provider
    web3Request("getTransaction", [hash], provider, (transaction) => {
      web3Request("getTransactionReceipt", [hash], provider, (receipt) => {
        dispatch({type: SET_CURRENT_TRANSACTION_SHOWN, transaction, receipt})
      })
    })
  }
}
export const clearTransactionShown = function() {
  return {type: SET_CURRENT_TRANSACTION_SHOWN, transaction: null, receipt: null}
}