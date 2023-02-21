import * as Accounts from "./actions";

const initialState = {
  addresses: [],
  balances: {},
  nonces: {},
};

export default function(state = initialState, action) {
  let balances;
  let nonces;
  switch (action.type) {
    case Accounts.GET_ACCOUNTS:
      var addresses = action.addresses;
      balances = Object.assign({}, state.balances);
      nonces = Object.assign({}, state.nonces);

      // Set default balance to zero if this is a new account
      addresses.forEach(address => {
        if (!balances[address]) balances[address] = "0";
        if (!nonces[address]) nonces[address] = 0;
      });

      return Object.assign({}, state, {
        addresses,
        balances,
        nonces,
      });

    case Accounts.GET_ACCOUNT_BALANCE:
      balances = Object.assign({}, state.balances, {
        [action.address]: action.balance,
      });
      return Object.assign({}, state, {
        balances,
      });

    case Accounts.GET_ACCOUNT_NONCE:
      nonces = Object.assign({}, state.nonces, {
        [action.address]: action.nonce,
      });
      return Object.assign({}, state, {
        nonces,
      });

    default:
      return state;
  }
}
