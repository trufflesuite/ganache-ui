import * as ApiHelpers from 'Data/Sources/ApiHelpers'

export default {
  startRpcService: (config) => {
    return ApiHelpers.sendIpcMessage('APP/STARTRPC', config)
  },

  getBlockchainState: () => {
    return ApiHelpers.sendIpcMessage('APP/GETBLOCKCHAINSTATE')
  },

  startMining: () => {
    return ApiHelpers.sendIpcMessage('APP/STARTMINING')
  },

  stopMining: () => {
    return ApiHelpers.sendIpcMessage('APP/STOPMINING')
  },

  forceMine: () => {
    return ApiHelpers.sendIpcMessage('APP/FORCEMINE')
  },

  makeSnapshot: () => {
    return ApiHelpers.sendIpcMessage('APP/MAKESNAPSHOT')
  },

  revertSnapshot: (snapshotId) => {
    return ApiHelpers.sendIpcMessage('APP/REVERTSNAPSHOT', snapshotId)
  },

  addAccount: (opts) => {
    return ApiHelpers.sendIpcMessage('APP/ADDACCOUNT', opts)
  },

  searchForBlock: (blockNumber) => {
    return ApiHelpers.sendIpcMessage('APP/SEARCHBLOCK', blockNumber)
  },

  searchForTx: (txHash) => {
    return ApiHelpers.sendIpcMessage('APP/SEARCHTX', txHash)
  }
}
