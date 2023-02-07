const Core = require("./actions");

const initialState = {
  flavor: "filecoin",
  isMining: true,
  seed: "",
  ipfsUrl: "",
  options: {},
  privateKeys: {},
  latestTipset: 0, // Tipset the current chain is on
  minerEnabled: null,
  latestDeal: 0,
  StorageDealStatus: {}
};

export default function(state = initialState, action) {
  switch (action.type) {
    case Core.SET_KEY_DATA:
      return Object.assign({}, state, {
        seed: action.seed,
        privateKeys: action.privateKeys,
      });

    case Core.SET_IPFS_URL:
      return Object.assign({}, state, {
        ipfsUrl: action.url
      });

    case Core.SET_CURRENT_OPTIONS:
      return Object.assign({}, state, {
        options: action.options
      });

    case Core.SET_TIPSET_NUMBER:
      return Object.assign({}, state, {
        latestTipset: action.number,
      });

    case Core.SET_MINER_ENABLED:
      return Object.assign({}, state, {
        minerEnabled: action.minerEnabled
      });

    case Core.SET_LATEST_DEAL_ID:
      return Object.assign({}, state, {
        latestDeal: action.id
      });

    case Core.SET_STORAGE_DEAL_STATUS_ENUM:
      return Object.assign({}, state, {
        StorageDealStatus: action.StorageDealStatus
      });

    default:
      return state;
  }
}
