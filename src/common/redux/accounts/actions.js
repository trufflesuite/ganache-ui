import { web3ActionCreator } from "../web3/helpers/Web3ActionCreator";

const prefix = "ACCOUNTS";

export const GET_ACCOUNTS = `${prefix}/GET_ACCOUNTS`;
export const getAccounts = function() {
  return async function(dispatch, getState) {
    let addresses = await web3ActionCreator(dispatch, getState, "getAccounts");
    var currentAddresses = getState().accounts.addresses;

    // Only save accounts if they've changed
    if (addresses.length > currentAddresses.length) {
      dispatch({ type: GET_ACCOUNTS, addresses });
    }

    addresses.forEach(address => {
      dispatch(getAccountBalance(address));
      dispatch(getAccountNonce(address));
    });
  };
};

export const GET_ACCOUNT_BALANCE = `${prefix}/GET_ACCOUNT_BALANCE`;
export const getAccountBalance = function(address) {
  return async function(dispatch, getState) {
    let balance = await web3ActionCreator(dispatch, getState, "getBalance", [
      address,
    ]);
    var currentBalance = getState().accounts.balances[address];

    // Remember, these are BigNumber objects
    if (balance.toString(10) != currentBalance.toString(10)) {
      dispatch({ type: GET_ACCOUNT_BALANCE, address, balance });
    }
  };
};

export const GET_ACCOUNT_NONCE = `${prefix}/GET_ACCOUNT_NONCE`;
export const getAccountNonce = function(address) {
  return async function(dispatch, getState) {
    let nonce = await web3ActionCreator(
      dispatch,
      getState,
      "getTransactionCount",
      [address],
    );
    var currentNonce = getState().accounts.nonces[address];

    if (nonce != currentNonce) {
      dispatch({ type: GET_ACCOUNT_NONCE, address, nonce });
    }
  };
};
