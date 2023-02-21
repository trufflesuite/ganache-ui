import FilecoinPrefix from "../prefix";
import { lotusRequest } from "../lotus/helpers/LotusActionCreator";
import { getTipset } from "../tipsets/actions";

const prefix = `${FilecoinPrefix}/MESSAGES`;
export const PAGE_SIZE = 10;

export const CLEAR_MESSAGES_IN_VIEW = `${prefix}/CLEAR_MESSAGES_IN_VIEW`;
export const clearMessagesInView = function() {
  return { type: CLEAR_MESSAGES_IN_VIEW, messages: [] };
};

export const SET_LOADING = `${prefix}/SET_LOADING`;
export const requestPage = function(startTipsetHeight, endTipsetHeight) {
  endTipsetHeight = endTipsetHeight || 0;
  return function(dispatch, getState) {
    if (startTipsetHeight == null) {
      startTipsetHeight = getState().filecoin.core.latestTipset;
    }

    const earliestTipsetRequested = Math.max(
      startTipsetHeight - PAGE_SIZE,
      endTipsetHeight,
    );
    dispatch(
      getMessagesForTipsets(earliestTipsetRequested, startTipsetHeight),
    );
  };
};

// The "next" page is the next set of blocks, from the last requested down to 0
export const requestNextPage = function() {
  return function(dispatch, getState) {
    const tipsetsRequested = Object.keys(getState().filecoin.messages.tipsetsRequested);
    const earliestTipsetRequested = Math.min.apply(Math, tipsetsRequested);
    dispatch(requestPage(earliestTipsetRequested - 1));
  };
};

export const requestPreviousPage = function() {
  return function(dispatch, getState) {
    const tipsetsRequested = Object.keys(getState().filecoin.messages.tipsetsRequested);

    if (tipsetsRequested.length == 0) {
      return dispatch(requestPage(getState().filecoin.core.latestTipset));
    }

    const latestTipsetRequested = Math.max.apply(Math, tipsetsRequested);
    const latestTipset = getState().filecoin.core.latestTipset;

    const startTipset = Math.min(latestTipset, latestTipsetRequested + PAGE_SIZE);
    const endTipset = latestTipsetRequested + 1;

    dispatch(requestPage(startTipset, endTipset));
  };
};

export const SET_TIPSET_REQUESTED = `${prefix}/SET_TIPSET_REQUESTED`;
export const ADD_MESSAGES_TO_VIEW = `${prefix}/ADD_MESSAGES_TO_VIEW`;
export const getMessagesForTipsets = function(
  startTipsetHeight,
  endTipsetHeight,
) {
  return async function(dispatch, getState) {
    dispatch({
      type: SET_LOADING,
      loading: true,
    });

    const state = getState();
    const lotusInstance = state.filecoin.lotus.lotusInstance;
    let messages = [];
    for (let number = endTipsetHeight; number >= startTipsetHeight; number--) {
      const requested = state.filecoin.messages.tipsetsRequested;

      // If it's already requested, bail
      if (requested[number] === true) {
        continue;
      }

      // It's not requested? Let's get the drop on it so
      // no other process requests it
      dispatch({ type: SET_TIPSET_REQUESTED, number });

      // Now request the tipset, all its blocks, and all of their messages
      const tipsetDetails = await getTipset(number, lotusInstance, dispatch, getState);

      if (tipsetDetails.messageCount == 0) {
        continue;
      }

      for (const block of tipsetDetails.tipset.Blocks) {
        messages = messages.concat(block.AdjustedBlockMessages);
      }
    }

    if (messages.length > 0) {
      dispatch({ type: ADD_MESSAGES_TO_VIEW, messages });
    }

    dispatch({
      type: SET_LOADING,
      loading: false,
    });
  };
};

export const SET_CURRENT_MESSAGE_SHOWN = `${prefix}/SET_CURRENT_MESSAGE_SHOWN`;
export const showMessage = function(cid) {
  return async function(dispatch, getState) {
    const state = getState();
    const currentBlock = state.filecoin.tipsets.currentBlock;

    let message;
    if (currentBlock) {
      message = currentBlock.AdjustedBlockMessages.find(m => m.cid["/"] === cid);
    }

    if (!message) {
      const lotusInstance = state.filecoin.lotus.lotusInstance;
      message = await lotusRequest("ChainGetMessage", [{
        "/": cid
      }], lotusInstance);
    }

    dispatch({
      type: SET_CURRENT_MESSAGE_SHOWN,
      message,
    });
  };
};

export const clearMessageShown = function() {
  return {
    type: SET_CURRENT_MESSAGE_SHOWN,
    message: null,
  };
};
