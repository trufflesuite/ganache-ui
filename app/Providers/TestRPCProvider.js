import { connect } from 'react-redux'

import { createRequestThunk } from 'Actions/ActionUtils'
import * as ApiHelpers from 'Actions/ApiHelpers'

import { createStructuredSelector } from 'reselect'

const appRestartRpcServiceType = 'APP/RESTARTRPC'
const appStartRpcServiceType = 'APP/STARTRPC'
const appGetBlockchainStateType = 'APP/GETBLOCKCHAINSTATE'
const appStartMiningType = 'APP/STARTMINING'
const appStopMiningType = 'APP/STOPMINING'
const appForceMineType = 'APP/FORCEMINE'
const appMakeSnapshotType = 'APP/MAKESNAPSHOT'
const appRevertSnapshotType = 'APP/REVERTSNAPSHOT'
const appAddAccountType = 'APP/ADDACCOUNT'
const appClearLogsType = 'APP/CLEARLOGS'
const appSearchBlockType = 'APP/SEARCHBLOCK'
const appSearchTxType = 'APP/SEARCHTX'
const appCheckPortType = 'APP/CHECKPORT'

const Api = {
  restartRpcService: (config) => {
    return ApiHelpers.sendIpcMessage('APP/RESTARTRPC', config)
  },

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
  },

  checkPort: (port) => {
    return ApiHelpers.sendIpcMessage('APP/CHECKPORT', port)
  }
}

export default connect((state) => {
  return {
    testRpcState: state.testrpcsource,

    appRestartRpcService: createRequestThunk({
      request: Api.restartRpcService,
      key: appRestartRpcServiceType,
      success: []
    }),

    appStartRpcService: createRequestThunk({
      request: Api.startRpcService,
      key: appStartRpcServiceType,
      success: []
    }),


    appGetBlockChainState: createRequestThunk({
      request: Api.getBlockchainState,
      key: appGetBlockchainStateType,
      success: []
    }),

    appStartMining: createRequestThunk({
      request: Api.startMining,
      key: appStartMiningType
    }),

    appStopMining: createRequestThunk({
      request: Api.stopMining,
      key: appStopMiningType
    }),

    appForceMine: createRequestThunk({
      request: Api.forceMine,
      key: appForceMineType
    }),

    appMakeSnapshot: createRequestThunk({
      request: Api.makeSnapshot,
      key: appMakeSnapshotType
    }),

    appRevertSnapshot: createRequestThunk({
      request: Api.revertSnapshot,
      key: appRevertSnapshotType
    }),

    appAddAccount: createRequestThunk({
      request: Api.addAccount,
      key: appAddAccountType
    }),

    appClearLogs: () => {
      return (dispatch, getState) => {
        dispatch({ type: appClearLogsType })
      }
    },

    appSearchBlock: createRequestThunk({
      request: Api.searchForBlock,
      key: appSearchBlockType
    }),

    appSearchTx: createRequestThunk({
      request: Api.searchForTx,
      key: appSearchTxType
    }),

    appCheckPort: createRequestThunk({
      request: Api.checkPort,
      key: appCheckPortType
    })
  }
})
