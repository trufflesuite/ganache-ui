import {
  GET_DECODED_EVENT,
  CLEAR_EVENTS_IN_VIEW,
  ADD_EVENTS_TO_VIEW,
  SET_BLOCKS_REQUESTED,
  SET_SUBSCRIBED_TOPICS,
  SET_LOADING,
} from "./actions";
import cloneDeep from "lodash.clonedeep";

const initialState = {
  inView: [],
  blocksRequested: {},
  shown: {
    contract: {
      name: "",
      address: "",
    },
  },
  subscribedTopics: [],
  loading: false,
};

// Note: This sorts in reverse; higher blocks first
function sort(events) {
  return events.sort(function(a, b) {
    if (a.blockNumber > b.blockNumber) {
      return -1;
    }
    if (a.blockNumber < b.blockNumber) {
      return 1;
    }
    // blockNumbers must be equal
    // Let's sort by transaction index
    if (a.transactionIndex > b.transactionIndex) {
      return -1;
    }
    if (b.transactionIndex < b.transactionIndex) {
      return 1;
    }
    // transactionIndex must be equal
    // Let's sort by log index
    if (a.logIndex > b.logIndex) {
      return -1;
    }
    if (b.logIndex < b.logIndex) {
      return 1;
    }
    return 0;
  });
}

export default function(state = initialState, action) {
  let nextState = cloneDeep(state);

  switch (action.type) {
    case GET_DECODED_EVENT:
      nextState.shown = {
        ...cloneDeep(action.event),
        contract: {
          name: action.contractName,
          address: action.contractAddress,
        },
      };
      break;
    case CLEAR_EVENTS_IN_VIEW:
      nextState.inView = [];
      nextState.blocksRequested = {};
      break;
    case SET_BLOCKS_REQUESTED:
      for (let i = action.start; i <= action.end; i++) {
        nextState.blocksRequested[i] = true;
      }
      break;
    case ADD_EVENTS_TO_VIEW:
      nextState.inView = sort(state.inView.concat(action.events));
      break;
    case SET_SUBSCRIBED_TOPICS:
      nextState.subscribedTopics = cloneDeep(action.topics);
      break;
    case SET_LOADING:
      nextState.loading = action.loading;
      break;
    default:
      break;
  }

  return nextState;
}
