import * as Deals from "./actions";
import clonedeep from "lodash.clonedeep";

const initialState = {
  inView: [],
  requested: {},
};

// Note: This sorts in reverse; higher tipset first
function sort(deals) {
  return deals.sort(function(a, b) {
    if (a.DealID > b.DealID) {
      return -1;
    }
    if (a.DealID < b.DealID) {
      return 1;
    }
    // a must be equal to b
    return 0;
  });
}

export default function(state = initialState, action) {
  switch (action.type) {
    case Deals.CLEAR_DEALS_IN_VIEW:
      return Object.assign({}, state, {
        inView: [],
        requested: {},
      });

    case Deals.SET_DEALS_REQUESTED: {
      let requested = Object.assign({}, state.requested);

      for (let i = action.startDealId; i <= action.endDealId; i++) {
        requested[i] = true;
      }

      return Object.assign({}, state, {
        requested,
      });
    }

    case Deals.ADD_DEALS_TO_VIEW: {
      let nextState = clonedeep(state);

      for (let i = 0; i < action.deals.length; i++) {
        const deal = action.deals[i];
        nextState.inView.push(deal);
      }

      nextState.inView = sort(nextState.inView);

      return nextState;
    }

    case Deals.UPDATE_DEAL_IN_VIEW: {
      const nextState = clonedeep(state);

      const dealIdx = nextState.inView.findIndex(d => d.DealID === action.deal.DealID);
      if (dealIdx >= 0) {
        nextState.inView[dealIdx] = action.deal;
      }

      return nextState;
    }

    default:
      return state;
  }
}
