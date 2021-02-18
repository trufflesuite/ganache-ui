import { lotusActionCreator } from "../../../common/redux/lotus/helpers/LotusActionCreator";
import { isEqual } from "lodash.isequal";
import FilecoinPrefix from "../prefix";

const prefix = `${FilecoinPrefix}/ACCOUNTS`;

export const GET_ACCOUNTS = `${prefix}/GET_ACCOUNTS`;
export const getAccounts = function() {
  return async function(dispatch, getState) {
    const addresses = await lotusActionCreator(dispatch, getState, "walletList");
    const currentAddresses = getState().accounts.addresses;

    // Only save accounts if they've changed
    if (addresses && !isEqual(addresses, currentAddresses)) {
      dispatch({ type: GET_ACCOUNTS, addresses });
    }
    if (addresses) {
      addresses.forEach(address => {
        dispatch(getAccountBalance(address));
        dispatch(getAccountNonce(address));
      });
    }
  };
};

export const GET_ACCOUNT_BALANCE = `${prefix}/GET_ACCOUNT_BALANCE`;
export const getAccountBalance = function(address) {
  return async function(dispatch, getState) {
    const balance = await lotusActionCreator(dispatch, getState, "walletBalance", [
      address,
    ]);
    const currentBalance = getState().accounts.balances[address];

    // Remember, these are strings (originally bigints)
    if (balance === undefined || currentBalance === undefined || balance !== currentBalance) {
      dispatch({ type: GET_ACCOUNT_BALANCE, address, balance });
    }
  };
};

export const GET_ACCOUNT_NONCE = `${prefix}/GET_ACCOUNT_NONCE`;
export const getAccountNonce = function(address) {
  return async function(dispatch, getState) {
    const nonce = await lotusActionCreator(
      dispatch,
      getState,
      "mpoolGetNonce",
      [address],
    );
    const currentNonce = getState().accounts.nonces[address];

    if (nonce !== currentNonce) {
      dispatch({ type: GET_ACCOUNT_NONCE, address, nonce });
    }
  };
};
