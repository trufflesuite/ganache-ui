import * as Blocks from "./actions";
import clonedeep from "lodash.clonedeep";

const initialState = {
  inView: [],
  inViewTransactionCounts: {},
  requested: {},
  currentBlock: null,
};

// Note: This sorts in reverse; higher blocks first
function sort(blocks) {
  return blocks.sort(function(a, b) {
    if (a.number > b.number) {
      return -1;
    }
    if (a.number < b.number) {
      return 1;
    }
    // a must be equal to b
    return 0;
  });
}

export default function(state = initialState, action) {
  switch (action.type) {
    case Blocks.CLEAR_BLOCKS_IN_VIEW:
      return Object.assign({}, state, {
        inView: [],
        inViewTransactionCounts: {},
        requested: {},
      });
    case Blocks.SET_BLOCKS_REQUESTED: {
      let requested = Object.assign({}, state.requested);

      for (let i = action.startBlockNumber; i <= action.endBlockNumber; i++) {
        requested[i] = true;
      }

      return Object.assign({}, state, {
        requested,
      });
    }
    case Blocks.ADD_BLOCKS_TO_VIEW: {
      let nextState = clonedeep(state);

      for (let i = 0; i < action.blocks.length; i++) {
        const block = action.blocks[i].block;
        nextState.inView.push(block);
        nextState.inViewTransactionCounts[block.number] =
          action.blocks[i].transactionCount;
      }

      nextState.inView = sort(nextState.inView);

      return nextState;
    }
    case Blocks.SET_CURRENT_BLOCK_SHOWN:
      return Object.assign({}, state, {
        currentBlock: action.block,
      });
    default:
      return state;
  }
}
