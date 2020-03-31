const prefix = "CORDA_CORE";
import { setToast } from "../../../common/redux/network/actions";
import { requestServerRestart } from "../../../common/redux/core/actions.js";

export const REFRESH_CORDAPP = `${prefix}/REFRESH_CORDAPP`;
export const sendRefreshCordapp = function(cordapps) {
  return { type: REFRESH_CORDAPP, cordapps };
};


export const refreshCordapp = function(cordapps) {
  return function(dispatch) {
    dispatch(setToast(cordapps.join(', ') + " has changed. Restart?", true, "Restart", () => {
      dispatch(requestServerRestart());
    }));
    return ({ type: REFRESH_CORDAPP, cordapps });
  };
}
