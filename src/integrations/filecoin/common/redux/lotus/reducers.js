import * as LotusAction from "./actions";

const initialState = {
  lotusInstance: null,
};

export default function(state = initialState, action) {
  switch (action.type) {
    case LotusAction.SET_LOTUS_INSTANCE:
      return Object.assign({}, state, {
        lotusInstance: action.lotusInstance,
      });

    default:
      return state;
  }
}
