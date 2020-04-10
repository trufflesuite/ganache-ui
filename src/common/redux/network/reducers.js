import * as Network from "./actions";
import cloneDeep from "lodash.clonedeep";

const initialState = {
  interfaces: {},
  toast: {date:Date.now(), message: null, infinite: false, buttonText: null, toastOnClick: null}
};

export default function(state = initialState, action) {
  let nextState = cloneDeep(state);

  switch (action.type) {
    case Network.SET_INTERFACES:
      // Ignore state; we're overwriting the settings.
      nextState.interfaces = cloneDeep(action.interfaces);
      break;
      case Network.SET_TOAST:
        // Ignore state; we're overwriting the settings.
        nextState.toast = {
          message: action.message,
          date: Date.now(),
          infinite: action.infinite,
          buttonText: action.buttonText,
          toastOnClick: action.toastOnClick
        };
        break;
    default:
      break;
  }

  return nextState;
}
