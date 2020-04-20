import * as CordaCore from "./actions";

export default function(state = {}, action) {
  switch (action.type) {
    case CordaCore.REFRESH_CORDAPP:
      console.log(action.queue);
      return state;
    default:
      return state;
  }
}
