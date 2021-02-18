import {
  lotusActionCreator,
} from "../lotus/helpers/LotusActionCreator";
import { getAccounts } from "../accounts/actions";
import FilecoinPrefix from "../prefix";

const prefix = `${FilecoinPrefix}/CORE`;

export const SET_KEY_DATA = `${prefix}/SET_KEY_DATA`;
export function setKeyData(mnemonic, hdPath, privateKeys) {
  return { type: SET_KEY_DATA, mnemonic, hdPath, privateKeys };
}

export const setTipsetNumberToLatest = function() {
  return async function(dispatch, getState) {
    const tipset = await lotusActionCreator(
      dispatch,
      getState,
      "chainHead",
      [],
    );

    // Refresh our accounts if the tipset changed.
    dispatch(setTipsetNumber(tipset.Height));
  };
};

export const SET_TIPSET_NUMBER = `${prefix}/SET_TIPSET_NUMBER`;
export const setTipsetNumber = function(number) {
  return function(dispatch) {
    dispatch({ type: SET_TIPSET_NUMBER, number });

    // Refresh our accounts if the block changed.
    dispatch(getAccounts());
  };
};

export const GET_TIPSET_SUBSCRIPTION = `${prefix}/GET_TIPSET_SUBSCRIPTION`;
export const getTipsetSubscription = function() {
  return async function(dispatch, getState) {
    const subscription = await lotusActionCreator(
      dispatch,
      getState,
      "chainNotify",
      []
    );

    subscription.on("data", tipset => {
      const currentTipsetHeight = getState().core.latestTipset;

      if (tipset.Height != currentTipsetHeight) {
        dispatch(setTipsetNumber(tipset.Height));
      }
    });
  };
};
