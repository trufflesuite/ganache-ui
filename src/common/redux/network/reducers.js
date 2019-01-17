import * as Network from "./actions";
import cloneDeep from "lodash.clonedeep";

const initialState = {
  interfaces: {},
};

export default function(state = initialState, action) {
  let nextState = cloneDeep(state);

  switch (action.type) {
    case Network.SET_INTERFACES:
      // Ignore state; we're overwriting the settings.
      nextState.interfaces = cloneDeep(action.interfaces);
      break;
    default:
      break;
  }

  return nextState;
}
