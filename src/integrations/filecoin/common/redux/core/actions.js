import {
  lotusActionCreator,
} from "../lotus/helpers/LotusActionCreator";
import { getAccounts } from "../accounts/actions";
import FilecoinPrefix from "../prefix";

const prefix = `${FilecoinPrefix}/CORE`;

export const SET_KEY_DATA = `${prefix}/SET_KEY_DATA`;
export function setKeyData(seed, privateKeys) {
  return { type: SET_KEY_DATA, seed, privateKeys };
}

export const SET_IPFS_URL = `${prefix}/SET_IPFS_URL`;
export function setIPFSUrl(url) {
  return { type: SET_IPFS_URL, url };
}

export const setTipsetNumberToLatest = function() {
  return async function(dispatch, getState) {
    const tipset = await lotusActionCreator(
      dispatch,
      getState,
      "ChainHead",
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
      "ChainNotify",
      []
    );

    subscription.on("data", headChanges => {
      const currentTipsetHeight = getState().core.latestTipset;

      const receivedHeight = headChanges.reduce((maxHeight, cur) => {
        return Math.max(maxHeight, cur.Val.Height);
      }, 0);

      if (receivedHeight != currentTipsetHeight) {
        dispatch(setTipsetNumber(receivedHeight));
      }
    });
  };
};
