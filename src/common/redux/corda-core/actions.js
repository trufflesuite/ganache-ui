const prefix = "CORDA_CORE";
import { setToast } from "../../../common/redux/network/actions";
import { requestServerRestart } from "../../../common/redux/core/actions.js";

export const REFRESH_CORDAPP = `${prefix}/REFRESH_CORDAPP`;
export const sendRefreshCordapp = function() {
  return { type: REFRESH_CORDAPP };
};

export const refreshCordapp = function() {
  return function(dispatch) {
    dispatch(setToast("Your cordapp(s) have changed. Would you like to restart Ganache?", true, "Restart", () => {
      dispatch(requestServerRestart());
    }));
    return ({ type: REFRESH_CORDAPP  });
  };
}
