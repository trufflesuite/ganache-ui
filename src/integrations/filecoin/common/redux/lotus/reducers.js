import * as LotusAction from "./actions";

const initialState = {
  lotusProvider: null,
};

export default function(state = initialState, action) {
  switch (action.type) {
    case LotusAction.SET_LOTUS_INSTANCE:
      return Object.assign({}, state, {
        lotusProvider: action.lotusProvider,
      });

    default:
      return state;
  }
}
