import {
  web3ActionCreator,
} from "../web3/helpers/Web3ActionCreator";
import { getAccounts } from "../accounts/actions";
import { ContractOnceRequiresCallbackError } from "web3";

const prefix = "CORE";

export const SET_KEY_DATA = `${prefix}/SET_KEY_DATA`;
export function setKeyData(mnemonic, hdPath, privateKeys) {
  return { type: SET_KEY_DATA, mnemonic, hdPath, privateKeys };
}

export const SET_GAS_PRICE = `${prefix}/SET_GAS_PRICE`;
export const getGasPrice = function () {
  return async function (dispatch, getState) {
    let gasPrice = await web3ActionCreator(dispatch, getState, "getGasPrice");
    var currentPrice = getState().core.gasPrice;
    gasPrice = gasPrice.toString(10);

    if (gasPrice != currentPrice) {
      dispatch({ type: SET_GAS_PRICE, gasPrice });
    }
  };
};

export const SET_GAS_LIMIT = `${prefix}/SET_GAS_LIMIT`;
export const getGasLimit = function () {
  return async function (dispatch, getState) {
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

export const setBlockNumberToLatest = function () {
  return async function (dispatch, getState) {
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
export const setBlockNumber = function (number) {
  return function (dispatch) {
    dispatch({ type: SET_BLOCK_NUMBER, number });

    // Refresh our accounts if the block changed.
    dispatch(getAccounts());
  };
};

export const GET_BLOCK_SUBSCRIPTION = `${prefix}/GET_BLOCK_SUBSCRIPTION`;
export const getBlockSubscription = function () {
  return async function (dispatch, getState) {
    let subscription = await web3ActionCreator(
      dispatch,
      getState,
      "subscribe",
      ["newHeads"],
    );

    subscription.on("data", blockHeader => {
      let currentBlockNumber = getState().core.latestBlock;

      if (Number(blockHeader.number) != currentBlockNumber) {
        dispatch(setBlockNumber(Number(blockHeader.number)));
      }
    });
  };
};
