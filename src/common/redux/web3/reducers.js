import * as Web3Action from "./actions";

const initialState = {
  web3Instance: null,
};

export default function(state = initialState, action) {
  switch (action.type) {
    case Web3Action.SET_WEB3_INSTANCE:
      return Object.assign({}, state, {
        web3Instance: action.web3Instance,
      });

    default:
      return state;
  }
}
