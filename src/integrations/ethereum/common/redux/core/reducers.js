const Core = require("./actions");

const initialState = {
  flavor: "ethereum",
  isMining: true,
  mnemonic: "",
  hdPath: "",
  privateKeys: {},
  latestBlock: 0, // Block the current chain is on
  lastRequestedBlock: -1, // Last block whose data was requested
  gasPrice: "0",
  gasLimit: "0",
  hardfork: "muirGlacir",
  snapshots: [],
  blocks: [],
  transactions: [],
};

export default function(state = initialState, action) {
  let accountBalances;
  let accountNonces;
  switch (action.type) {
    case Core.SET_KEY_DATA:
      return Object.assign({}, state, {
        mnemonic: action.mnemonic,
        hdPath: action.hdPath,
        privateKeys: action.privateKeys,
      });
    case Core.SET_LAST_REQUESTED_BLOCK_NUMBER:
      return Object.assign({}, state, {
        lastRequestedBlock: action.number,
      });

    case Core.GET_ACCOUNTS:
      var accounts = action.accounts;
      accountBalances = Object.assign({}, state.accountBalances);
      accountNonces = Object.assign({}, state.accountNonces);

      // Set default balance to zero if this is a new account
      accounts.forEach(account => {
        if (!accountBalances[account]) accountBalances[account] = "0";
        if (!accountNonces[account]) accountNonces[account] = 0;
      });

      return Object.assign({}, state, {
        accounts,
        accountBalances,
        accountNonces,
      });

    case Core.GET_ACCOUNT_BALANCE:
      accountBalances = Object.assign({}, state.accountBalances, {
        [action.account]: action.balance,
      });
      return Object.assign({}, state, {
        accountBalances,
      });

    case Core.GET_ACCOUNT_NONCE:
      accountNonces = Object.assign({}, state.accountNonces, {
        [action.account]: action.nonce,
      });
      return Object.assign({}, state, {
        accountNonces,
      });

    case Core.SET_GAS_PRICE:
      return Object.assign({}, state, {
        gasPrice: action.gasPrice,
      });

    case Core.SET_GAS_LIMIT:
      return Object.assign({}, state, {
        gasLimit: action.gasLimit,
      });

    case Core.SET_BLOCK_NUMBER:
      return Object.assign({}, state, {
        latestBlock: action.number,
      });

    default:
      return state;
  }
}
