import * as Messages from "./actions";

const initialState = {
  inView: [],
  tipsetsRequested: {},
  currentMessage: null,
  loading: false,
};

// Note: This sorts higher messages from tipsets first
function sort(messages) {
  return messages.sort(function(a, b) {
    if (a.tipsetHeight > b.tipsetHeight) {
      return -1;
    }
    if (a.tipsetHeight < b.tipsetHeight) {
      return 1;
    }
    // if the messages are at the same height,
    // then we'll just assume they are already in
    // index order. BlockMessages has two
    // separate arrays for BlsMessages and SecpkMessages
    // so we can't use the array index to know the
    // message pool execution order. there really isn't
    // any way with the api to get the original message
    // pool execution order
    return 0;
  });
}

export default function(state = initialState, action) {
  switch (action.type) {
    case Messages.CLEAR_MESSAGES_IN_VIEW:
      return Object.assign({}, state, {
        inView: [],
        tipsetsRequested: {},
      });
    case Messages.SET_TIPSET_REQUESTED:
      var tipsetsRequested = Object.assign({}, state.tipsetsRequested, {
        [action.number]: true,
      });
      return Object.assign({}, state, {
        tipsetsRequested,
      });
    case Messages.ADD_MESSAGES_TO_VIEW: {
      let inView = state.inView.concat(action.messages);

      return Object.assign({}, state, {
        inView: sort(inView),
      });
    }
    case Messages.SET_CURRENT_MESSAGE_SHOWN:
      return Object.assign({}, state, {
        currentMessage: action.message,
      });
    case Messages.SET_LOADING: {
      return Object.assign({}, state, { loading: action.loading });
    }
    default:
      return state;
  }
}
