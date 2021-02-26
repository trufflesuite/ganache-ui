import {
  lotusActionCreator,
} from "../lotus/helpers/LotusActionCreator";
import { getAccounts } from "../accounts/actions";
import FilecoinPrefix from "../prefix";
import { updateDealInView } from "../deals/actions";

const prefix = `${FilecoinPrefix}/CORE`;

export const SET_KEY_DATA = `${prefix}/SET_KEY_DATA`;
export function setKeyData(seed, privateKeys) {
  return { type: SET_KEY_DATA, seed, privateKeys };
}

export const SET_IPFS_URL = `${prefix}/SET_IPFS_URL`;
export function setIPFSUrl(url) {
  return { type: SET_IPFS_URL, url };
}

export const SET_CURRENT_OPTIONS = `${prefix}/SET_CURRENT_OPTIONS`;
export function setCurrentOptions(options) {
  return { type: SET_CURRENT_OPTIONS, options };
}

export const SET_STORAGE_DEAL_STATUS_ENUM = `${prefix}/SET_STORAGE_DEAL_STATUS_ENUM`;
export function setStorageDealStatusEnum(StorageDealStatus) {
  return { type: SET_STORAGE_DEAL_STATUS_ENUM, StorageDealStatus };
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
      const currentTipsetHeight = getState().filecoin.core.latestTipset;

      const receivedHeight = headChanges.reduce((maxHeight, cur) => {
        return Math.max(maxHeight, cur.Val.Height);
      }, 0);

      if (receivedHeight != currentTipsetHeight) {
        dispatch(setTipsetNumber(receivedHeight));
      }
    });
  };
};

export const SET_MINER_ENABLED = `${prefix}/SET_MINER_ENABLED`;
export const setMinerEnabled = function(minerEnabled) {
  return function(dispatch) {
    dispatch({ type: SET_MINER_ENABLED, minerEnabled });
  };
};

export const GET_MINER_ENABLED_SUBSCRIPTION = `${prefix}/GET_MINER_ENABLED_SUBSCRIPTION`;
export const getMinerEnabledSubscription = function() {
  return async function(dispatch, getState) {
    const subscription = await lotusActionCreator(
      dispatch,
      getState,
      "GanacheMinerEnabledNotify",
      []
    );

    subscription.on("data", minerEnabled => {
      dispatch(setMinerEnabled(minerEnabled));
    });
  };
};

export const SET_LATEST_DEAL_ID = `${prefix}/SET_LATEST_DEAL_ID`;
export const setLatestDealId = function(id) {
  return function(dispatch) {
    dispatch({ type: SET_LATEST_DEAL_ID, id });
  };
};

export const GET_DEAL_SUBSCRIPTION = `${prefix}/GET_DEAL_SUBSCRIPTION`;
export const getDealSubscription = function() {
  return async function(dispatch, getState) {
    const subscription = await lotusActionCreator(
      dispatch,
      getState,
      "ClientGetDealUpdates",
      []
    );

    subscription.on("data", deal => {
      const latestDeal = getState().filecoin.core.latestDeal;

      if (deal.DealID > latestDeal) {
        dispatch(setLatestDealId(deal.DealID));
      }

      dispatch(updateDealInView(deal));
    });
  };
};
