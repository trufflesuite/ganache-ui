import {
  web3Request,
  web3ActionCreator,
} from "../../redux/web3/helpers/Web3ActionCreator";
import * as Transactions from "../../redux/transactions/actions";

const prefix = "BLOCKS";
const PAGE_SIZE = 15;

export const CLEAR_BLOCKS_IN_VIEW = `${prefix}/CLEAR_BLOCKS_IN_VIEW`;
export const clearBlocksInView = function () {
  return { type: CLEAR_BLOCKS_IN_VIEW, blocks: [] };
};

/**
 *
 * @param {number} startBlockNumber
 * @param {number} endBlockNumber
 * @returns {function(dispatch, getState): Promise<void>}
 */
export const requestPage = function (startBlockNumber, endBlockNumber) {
  return function (dispatch, getState) {
    if (startBlockNumber == null) {
      startBlockNumber = getState().core.latestBlock;
    }
    if (endBlockNumber == null) {
      const state = getState();
      endBlockNumber = state.config.settings.workspace.server.fork
        ? state.config.settings.workspace.server.fork_block_number + 1
        : 0;
    }

    let earliestBlockToRequest = Math.max(
      startBlockNumber - PAGE_SIZE,
      endBlockNumber,
    );
    dispatch(addBlocksToView(earliestBlockToRequest, startBlockNumber));
  };
};

// The "next" page is the next set of blocks, from the last requested down to 0
export const requestNextPage = function () {
  return function (dispatch, getState) {
    var blocksInView = getState().blocks.inView;
    var earliestBlockInView = Number(blocksInView[blocksInView.length - 1].number);
    dispatch(requestPage(earliestBlockInView - 1));
  };
};

export const requestPreviousPage = function () {
  return function (dispatch, getState) {
    var blocksInView = getState().blocks.inView;

    if (blocksInView.length == 0) {
      return dispatch(requestPage(getState().core.latestBlock));
    }

    var latestBlockInView = Number(blocksInView[0].number);
    var latestBlock = getState().core.latestBlock;

    var startBlock = Math.min(latestBlock, latestBlockInView + PAGE_SIZE);
    var endBlock = latestBlockInView + 1;

    dispatch(requestPage(startBlock, endBlock));
  };
};

export const SET_BLOCKS_REQUESTED = `${prefix}/SET_BLOCKS_REQUESTED`;
export const ADD_BLOCKS_TO_VIEW = `${prefix}/ADD_BLOCKS_TO_VIEW`;

export const addBlocksToView = function (startBlockNumber, endBlockNumber) {
  return async function (dispatch, getState) {
    const state = getState();
    const requested = state.blocks.requested;
    const web3Instance = state.web3.web3Instance;

    // we already have a copy of the blocks that haven't been
    // requested yet; let's make sure no one requests any of
    // the blocks in this range, regardles if they've already
    // been requested
    dispatch({ type: SET_BLOCKS_REQUESTED, startBlockNumber, endBlockNumber });

    let blocks = [];
    for (let i = startBlockNumber; i <= endBlockNumber; i++) {
      if (requested[i] === true) {
        // skip already requested blocks
        continue;
      }

      const blockDetails = await getBlock(i, web3Instance);
      if (blockDetails.block) {
        blocks.push(blockDetails);
      }
    }

    dispatch({ type: ADD_BLOCKS_TO_VIEW, blocks });
  };
};

const getBlock = async function (number, web3Instance) {
  // Now actually request it
  let block = await web3Request("getBlock", [number, false], web3Instance);
  let transactionCount = await web3Request(
    "getBlockTransactionCount",
    [block.hash],
    web3Instance,
  );

  return { block, transactionCount };
};

export const SET_CURRENT_BLOCK_SHOWN = `${prefix}/SET_CURRENT_BLOCK_SHOWN`;
export const showBlock = function (number) {
  return async function (dispatch, getState) {
    let block = await web3ActionCreator(dispatch, getState, "getBlock", [
      number,
      true,
    ]);

    const receipts = await Transactions.getReceipts(
      block.transactions,
      getState().web3.web3Instance,
    );
    const receiptMap = {};
    receipts.forEach(receipt => {
      if (receipt && receipt.transactionHash) {
        receiptMap[receipt.transactionHash] = receipt;
      }
    });
    block.receipts = receiptMap;

    dispatch({ type: SET_CURRENT_BLOCK_SHOWN, block });
  };
};
export const clearBlockShown = function () {
  return { type: SET_CURRENT_BLOCK_SHOWN, block: null };
};
