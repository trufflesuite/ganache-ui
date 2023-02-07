import * as LotusAction from "./actions";

const initialState = {
  lotusInstance: null,
  schema: {}
};

export default function(state = initialState, action) {
  switch (action.type) {
    case LotusAction.SET_LOTUS_INSTANCE:
      return Object.assign({}, state, {
        lotusInstance: action.lotusInstance,
      });

    case LotusAction.SET_LOTUS_SCHEMA:
      return Object.assign({}, state, {
        schema: action.schema,
      });

    default:
      return state;
  }
}
