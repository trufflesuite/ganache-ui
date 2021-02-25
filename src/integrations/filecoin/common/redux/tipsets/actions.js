import FilecoinPrefix from "../prefix";
import { lotusRequest } from "../lotus/helpers/LotusActionCreator";
import * as RequestCache from "../request-cache/actions";

const prefix = `${FilecoinPrefix}/TIPSETS`;
const PAGE_SIZE = 15;

export const CLEAR_TIPSETS_IN_VIEW = `${prefix}/CLEAR_TIPSETS_IN_VIEW`;
export const clearTipsetsInView = function() {
  return { type: CLEAR_TIPSETS_IN_VIEW, tipsets: [] };
};

export const requestPage = function(startTipsetHeight, endTipsetHeight) {
  endTipsetHeight = endTipsetHeight || 0;
  return function(dispatch, getState) {
    if (typeof startTipsetHeight === "undefined" || startTipsetHeight === null) {
      startTipsetHeight = getState().filecoin.core.latestTipset;
    }

    let earliestTipsetToRequest = Math.max(
      startTipsetHeight - PAGE_SIZE,
      endTipsetHeight,
    );
    dispatch(addTipsetsToView(earliestTipsetToRequest, startTipsetHeight));
  };
};

// The "next" page is the next set of blocks, from the last requested down to 0
export const requestNextPage = function() {
  return function(dispatch, getState) {
    var blocksInView = getState().filecoin.tipsets.inView;
    var earliestBlockInView = blocksInView[blocksInView.length - 1].number;
    dispatch(requestPage(earliestBlockInView - 1));
  };
};

export const requestPreviousPage = function() {
  return function(dispatch, getState) {
    const tipsetsInView = getState().filecoin.tipsets.inView;

    if (tipsetsInView.length == 0) {
      return dispatch(requestPage(getState().filecoin.core.latestTipset));
    }

    const latestTipsetInView = tipsetsInView[0].Height;
    const latestTipset = getState().filecoin.core.latestTipset;

    const startTipsetHeight = Math.min(latestTipset, latestTipsetInView + PAGE_SIZE);
    const endTipsetHeight = latestTipsetInView + 1;

    dispatch(requestPage(startTipsetHeight, endTipsetHeight));
  };
};

export const SET_TIPSETS_REQUESTED = `${prefix}/SET_TIPSETS_REQUESTED`;
export const ADD_TIPSETS_TO_VIEW = `${prefix}/ADD_TIPSETS_TO_VIEW`;

export const addTipsetsToView = function(startTipsetHeight, endTipsetHeight) {
  return async function(dispatch, getState) {
    const state = getState();
    const requested = state.filecoin.tipsets.requested;
    const lotusInstance = state.filecoin.lotus.lotusInstance;

    // we already have a copy of the tipsets that haven't been
    // requested yet; let's make sure no one requests any of
    // the tipsets in this range, regardless if they've already
    // been requested
    dispatch({ type: SET_TIPSETS_REQUESTED, startTipsetHeight, endTipsetHeight });

    const tipsets = [];
    for (let i = startTipsetHeight; i <= endTipsetHeight; i++) {
      if (requested[i] === true) {
        // skip already requested tipsets
        continue;
      }

      const tipsetDetails = await getTipset(i, lotusInstance, dispatch, getState);
      if (tipsetDetails.tipset) {
        tipsets.push(tipsetDetails);
      }
    }

    dispatch({ type: ADD_TIPSETS_TO_VIEW, tipsets });
  };
};

export const getTipset = async function(height, lotusInstance, dispatch, getState) {
  // this call returns the tipset with the blocks filled
  const tipset = await lotusRequest("ChainGetTipSetByHeight", [height], lotusInstance);

  let messageCount = 0;
  let gasUsed = 0;
  for (let i = 0; i < tipset.Blocks.length; i++) {
    const block = tipset.Blocks[i];
    const blockCid = tipset.Cids[i];

    // we add the block messages to the block for accessibility
    // ease later on. These will be the `Message` of each block
    // message (no `SignedMessage`s) with an injected `cid` field.
    // we also add the tipset height for sorting the messages screen
    block.AdjustedBlockMessages = []

    // since we have included block headers, we technically can cache
    // them in the request cache to prevent future retrieval
    dispatch(RequestCache.cacheRequest({
      method: "Filecoin.ChainGetBlock",
      params: [blockCid]
    }, block));

    // we also need to fetch the block messages to get the
    // number of messages and total gas used
    const blockMessages = await lotusRequest("ChainGetBlockMessages", [blockCid], lotusInstance);
    messageCount += blockMessages.Cids.length;

    // we should also cache each individual message
    for (let j = 0; j < blockMessages.BlsMessages.length; j++) {
      const message = blockMessages.BlsMessages[j];
      const messageCid = blockMessages.Cids[j];
      gasUsed += message.GasLimit;
      block.AdjustedBlockMessages.push({
        cid: messageCid,
        tipsetHeight: tipset.Height,
        blockCid,
        ...message
      });

      const payload = {
        method: "Filecoin.ChainGetMessage",
        params: [messageCid]
      };

      if (RequestCache.checkCache(payload, getState) === null) {
        dispatch(RequestCache.cacheRequest(payload, message));
      }
    }

    for (let j = 0; j < blockMessages.SecpkMessages.length; j++) {
      const secpkMessage = blockMessages.SecpkMessages[j];
      const secpkMessageCid = blockMessages.Cids[blockMessages.BlsMessages.length + j];
      gasUsed += secpkMessage.Message.GasLimit;
      block.AdjustedBlockMessages.push({
        cid: secpkMessageCid,
        tipsetHeight: tipset.Height,
        ...secpkMessage.Message
      });

      const payload = {
        method: "Filecoin.ChainGetMessage",
        params: [secpkMessageCid]
      };

      if (RequestCache.checkCache(payload, getState) === null) {
        dispatch(RequestCache.cacheRequest(payload, secpkMessage.Message));
      }
    }
  }

  return { tipset, messageCount, gasUsed };
};

export const SET_CURRENT_TIPSET_SHOWN = `${prefix}/SET_CURRENT_TIPSET_SHOWN`;
export const showTipset = function(height) {
  return async function(dispatch, getState) {
    const lotusInstance = getState().filecoin.lotus.lotusInstance;
    const tipsetDetails = await getTipset(height, lotusInstance, dispatch, getState);
    dispatch({ type: SET_CURRENT_TIPSET_SHOWN, tipsetDetails });
  };
};

export const clearTipsetShown = function() {
  return { type: SET_CURRENT_TIPSET_SHOWN, tipsetDetails: null };
};

export const SET_CURRENT_BLOCK_SHOWN = `${prefix}/SET_CURRENT_BLOCK_SHOWN`;
export const showBlock = function(cid) {
  return async function(dispatch, getState) {
    const tipset = getState().filecoin.tipsets.currentTipsetDetails.tipset;
    const blockIdx = tipset.Cids.findIndex(rootCid => rootCid["/"] === cid);
    if (blockIdx >= 0) {
      const block = tipset.Blocks[blockIdx];
      dispatch({ type: SET_CURRENT_BLOCK_SHOWN, block });
    }
  };
};

export const clearBlockShown = function() {
  return { type: SET_CURRENT_BLOCK_SHOWN, block: null };
};
