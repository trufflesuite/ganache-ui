
import { web3Request, web3ActionCreator } from './helpers/Web3ActionCreator'

const prefix = 'BLOCKS'
const PAGE_SIZE = 15

export const CLEAR_BLOCKS_IN_VIEW = `${prefix}/CLEAR_BLOCKS_IN_VIEW`
export const clearBlocksInView = function() {
  return { type: CLEAR_BLOCKS_IN_VIEW, blocks: [] }
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
      dispatch(getBlock(currentBlock))
      currentBlock -= 1
    }
  }  
}

// The "next" page is the next set of blocks, from the last requested down to 0
export const requestNextPage = function() {
  return function(dispatch, getState) {
    var blocksInView = getState().blocks.inView
    var earliestBlockInView = blocksInView[blocksInView.length - 1].number
    dispatch(requestPage(earliestBlockInView - 1))
  }
}

export const requestPreviousPage = function() {
  return function(dispatch, getState) {
    var blocksInView = getState().blocks.inView

    if (blocksInView.length == 0) {
      return dispatch(requestPage(getState().core.latestBlock))
    }

    var latestBlockInView = blocksInView[0].number
    var latestBlock = getState().core.latestBlock
  
    var startBlock = Math.min(latestBlock, latestBlockInView + PAGE_SIZE)
    var endBlock = latestBlockInView + 1

    dispatch(requestPage(startBlock, endBlock))
  }
}

export const SET_BLOCK_REQUESTED = `${prefix}/SET_BLOCK_REQUESTED`
export const ADD_BLOCK_TO_VIEW = `${prefix}/ADD_BLOCK_TO_VIEW`
export const getBlock = function(number) {
  return function(dispatch, getState) {
    let requested = getState().blocks.requested

    // If it's already requested, bail
    if (requested[number] === true) {
      return
    }

    let provider = getState().web3.provider

    // It's not requested? Let's get the drop on it so 
    // no other process requests it
    dispatch({type: SET_BLOCK_REQUESTED, number })

    // Now actually request it
    web3Request("getBlock", [number, true], provider, (err, block) => {
      dispatch({type: ADD_BLOCK_TO_VIEW, block })
    })
  }
}

export const SET_CURRENT_BLOCK_SHOWN = `${prefix}/SET_CURRENT_BLOCK_SHOWN`
export const showBlock = function(number) {
  console.log("SHOW BLOCK", number)
  return web3ActionCreator("getBlock", [number, true], (block, dispatch, getState) => {
    dispatch({type: SET_CURRENT_BLOCK_SHOWN, block})
  })
}
export const clearBlockShown = function() {
  return {type: SET_CURRENT_BLOCK_SHOWN, block: null}
}