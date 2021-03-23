import FilecoinPrefix from "../prefix";
import { lotusRequest } from "../lotus/helpers/LotusActionCreator";

const prefix = `${FilecoinPrefix}/DEALS`;
const PAGE_SIZE = 15;

export const CLEAR_DEALS_IN_VIEW = `${prefix}/CLEAR_DEALS_IN_VIEW`;
export const clearDealsInView = function() {
  return { type: CLEAR_DEALS_IN_VIEW, deals: [] };
};

export const requestPage = function(startDealId, endDealId) {
  endDealId = endDealId || 0;
  return function(dispatch, getState) {
    if (typeof startDealId === "undefined" || startDealId === null) {
      startDealId = getState().filecoin.core.latestDeal;
    }

    let earliestDealToRequest = Math.max(
      startDealId - PAGE_SIZE,
      endDealId,
    );
    dispatch(addDealToView(earliestDealToRequest, startDealId));
  };
};

// The "next" page is the next set of blocks, from the last requested down to 0
export const requestNextPage = function() {
  return function(dispatch, getState) {
    const dealsInView = getState().filecoin.deals.inView;
    const earliestDealInView = dealsInView[dealsInView.length - 1].DealID;
    dispatch(requestPage(earliestDealInView - 1));
  };
};

export const requestPreviousPage = function() {
  return function(dispatch, getState) {
    const dealsInView = getState().filecoin.deals.inView;

    if (dealsInView.length == 0) {
      return dispatch(requestPage(getState().filecoin.core.latestDeal));
    }

    const latestDealInView = dealsInView[0].DealID;
    const latestDeal = getState().filecoin.core.latestDeal;

    const startDealId = Math.min(latestDeal, latestDealInView + PAGE_SIZE);
    const endDealId = latestDealInView + 1;

    dispatch(requestPage(startDealId, endDealId));
  };
};

export const SET_DEALS_REQUESTED = `${prefix}/SET_DEALS_REQUESTED`;
export const ADD_DEALS_TO_VIEW = `${prefix}/ADD_DEALS_TO_VIEW`;

export const addDealToView = function(startDealId, endDealId) {
  return async function(dispatch, getState) {
    const state = getState();
    const requested = state.filecoin.deals.requested;
    const lotusInstance = state.filecoin.lotus.lotusInstance;

    // we already have a copy of the tipsets that haven't been
    // requested yet; let's make sure no one requests any of
    // the tipsets in this range, regardless if they've already
    // been requested
    dispatch({ type: SET_DEALS_REQUESTED, startDealId, endDealId });

    const deals = [];
    for (let i = startDealId; i <= endDealId; i++) {
      if (requested[i] === true) {
        // skip already requested tipsets
        continue;
      }

      const deal = await getDeal(i, lotusInstance);
      if (deal) {
        deals.push(deal);
      }
    }

    dispatch({ type: ADD_DEALS_TO_VIEW, deals });
  };
};

export const getDeal = async function(id, lotusInstance) {
  const deal = await lotusRequest("GanacheGetDealById", [id], lotusInstance);

  return deal;
};

export const UPDATE_DEAL_IN_VIEW = `${prefix}/UPDATE_DEAL_IN_VIEW`;
export const updateDealInView = function(deal) {
  return { type: UPDATE_DEAL_IN_VIEW, deal };
};
