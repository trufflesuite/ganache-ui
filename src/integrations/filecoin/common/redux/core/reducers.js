const Core = require("./actions");

const initialState = {
  flavor: "filecoin",
  isMining: true,
  seed: "",
  ipfsUrl: "",
  privateKeys: {},
  latestTipset: 0, // Tipset the current chain is on
  tipsets: [],
  blocks: [],
  messages: []
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

    case Core.SET_TIPSET_NUMBER:
      return Object.assign({}, state, {
        latestTipset: action.number,
      });

    default:
      return state;
  }
}
