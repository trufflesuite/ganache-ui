import * as Tipsets from "./actions";
import clonedeep from "lodash.clonedeep";

const initialState = {
  inView: [],
  inViewMessageCounts: {},
  inViewGasUsed: {},
  requested: {},
  currentTipsetDetails: null,
  currentBlock: null,
};

// Note: This sorts in reverse; higher tipset first
function sort(tipset) {
  return tipset.sort(function(a, b) {
    if (a.Height > b.Height) {
      return -1;
    }
    if (a.Height < b.Height) {
      return 1;
    }
    // a must be equal to b
    return 0;
  });
}

export default function(state = initialState, action) {
  switch (action.type) {
    case Tipsets.CLEAR_TIPSETS_IN_VIEW:
      return Object.assign({}, state, {
        inView: [],
        inViewMessageCounts: {},
        inViewGasUsed: {},
        requested: {},
      });

    case Tipsets.SET_TIPSETS_REQUESTED: {
      let requested = Object.assign({}, state.requested);

      for (let i = action.startTipsetHeight; i <= action.endTipsetHeight; i++) {
        requested[i] = true;
      }

      return Object.assign({}, state, {
        requested,
      });
    }

    case Tipsets.ADD_TIPSETS_TO_VIEW: {
      let nextState = clonedeep(state);

      for (let i = 0; i < action.tipsets.length; i++) {
        const tipsetDetails = action.tipsets[i];
        const tipset = tipsetDetails.tipset;
        nextState.inView.push(tipset);
        nextState.inViewMessageCounts[tipset.Height] = tipsetDetails.messageCount;
        nextState.inViewGasUsed[tipset.Height] = tipsetDetails.gasUsed;
      }

      nextState.inView = sort(nextState.inView);

      return nextState;
    }

    case Tipsets.SET_CURRENT_TIPSET_SHOWN:
      return Object.assign({}, state, {
        currentTipsetDetails: action.tipsetDetails,
      });

    case Tipsets.SET_CURRENT_BLOCK_SHOWN:
      return Object.assign({}, state, {
        currentBlock: action.block,
      });

    default:
      return state;
  }
}
