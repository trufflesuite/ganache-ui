import { push } from "react-router-redux";
import { ipcRenderer } from "electron";

import {
  web3CleanUpHelper,
  web3ActionCreator,
} from "../web3/helpers/Web3ActionCreator";
import { getAccounts } from "../accounts/actions";

const prefix = "CORE";

const cleanupWorkspace = function(dispatch, getState) {
  web3CleanUpHelper(dispatch, getState);

  dispatch(push("/loader"));

  // Dispatch REQUEST_SERVER_RESTART to the store
  // This will clear all state.
  dispatch({ type: REQUEST_SERVER_RESTART });
};

export const SET_SERVER_STARTED = `${prefix}/SET_SERVER_STARTED`;
export function setServerStarted() {
  return { type: SET_SERVER_STARTED };
}

export const REQUEST_SERVER_RESTART = `${prefix}/REQUEST_SERVER_RESTART`;
export function requestServerRestart() {
  return function(dispatch, getState) {
    // Fire off the restart request.
    cleanupWorkspace(dispatch, getState);
    ipcRenderer.send(REQUEST_SERVER_RESTART);
  };
}

export const SHOW_TITLE_SCREEN = `${prefix}/SHOW_TITLE_SCREEN`;
export function showTitleScreen() {
  return function(dispatch) {
    dispatch(push("/title"));
  };
}

export const SHOW_HOME_SCREEN = `${prefix}/SHOW_HOME_SCREEN`;
export function showHomeScreen() {
  return function(dispatch) {
    dispatch(push("/home"));
  };
}

export const SET_KEY_DATA = `${prefix}/SET_KEY_DATA`;
export function setKeyData(mnemonic, hdPath, privateKeys) {
  return { type: SET_KEY_DATA, mnemonic, hdPath, privateKeys };
}

export const SET_GAS_PRICE = `${prefix}/SET_GAS_PRICE`;
export const getGasPrice = function() {
  return async function(dispatch, getState) {
    let gasPrice = await web3ActionCreator(dispatch, getState, "getGasPrice");
    var currentPrice = getState().core.gasPrice;
    gasPrice = gasPrice.toString(10);

    if (gasPrice != currentPrice) {
      dispatch({ type: SET_GAS_PRICE, gasPrice });
    }
  };
};

export const SET_GAS_LIMIT = `${prefix}/SET_GAS_LIMIT`;
export const getGasLimit = function() {
  return async function(dispatch, getState) {
    let block = await web3ActionCreator(dispatch, getState, "getBlock", [
      "latest",
    ]);
    var currentGasLimit = getState().core.gasLimit;

    var gasLimit = block.gasLimit.toString();

    if (gasLimit != currentGasLimit) {
      dispatch({ type: SET_GAS_LIMIT, gasLimit });
    }
  };
};

export const setBlockNumberToLatest = function() {
  return async function(dispatch, getState) {
    const blockNumber = await web3ActionCreator(
      dispatch,
      getState,
      "getBlockNumber",
      [],
    );

    // Refresh our accounts if the block changed.
    dispatch(setBlockNumber(blockNumber));
  };
};

export const SET_BLOCK_NUMBER = `${prefix}/SET_BLOCK_NUMBER`;
export const setBlockNumber = function(number) {
  return function(dispatch) {
    dispatch({ type: SET_BLOCK_NUMBER, number });

    // Refresh our accounts if the block changed.
    dispatch(getAccounts());
  };
};

export const GET_BLOCK_SUBSCRIPTION = `${prefix}/GET_BLOCK_SUBSCRIPTION`;
export const getBlockSubscription = function() {
  return async function(dispatch, getState) {
    let subscription = await web3ActionCreator(
      dispatch,
      getState,
      "subscribe",
      ["newBlockHeaders"],
    );

    subscription.on("data", blockHeader => {
      let currentBlockNumber = getState().core.latestBlock;

      if (blockHeader.number != currentBlockNumber) {
        dispatch(setBlockNumber(blockHeader.number));
      }
    });
  };
};

export const SET_SYSTEM_ERROR = `${prefix}/SET_SYSTEM_ERROR`;
export const setSystemError = function(error, showBugModal, category, detail) {
  return { type: SET_SYSTEM_ERROR, error, showBugModal, category, detail };
};

export const SET_MODAL_ERROR = `${prefix}/SET_MODAL_ERROR`;
export const setModalError = function(error) {
  return { type: SET_MODAL_ERROR, error };
};

export const DISMISS_MODAL_ERROR = `${prefix}/DISMISS_MODAL_ERROR`;
export const dismissModalError = function() {
  return { type: DISMISS_MODAL_ERROR };
};

export const DISMISS_BUG_MODAL = `${prefix}/DISMISS_BUG_MODAL`;
export const dismissBugModal = function() {
  return { type: DISMISS_BUG_MODAL };
};
