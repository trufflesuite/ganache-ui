import Api from './Api'
import { createRequestThunk } from 'Data/Sources/ActionUtils'

export const appStartRpcServiceType = 'APP/STARTRPC'
export const appStartRpcService = createRequestThunk({
  request: Api.startRpcService,
  key: appStartRpcServiceType,
  success: []
})

export const appGetBlockchainStateType = 'APP/GETBLOCKCHAINSTATE'
export const appGetBlockChainState = createRequestThunk({
  request: Api.getBlockchainState,
  key: appGetBlockchainStateType,
  success: []
})

export const appStartMiningType = 'APP/STARTMINING'
export const appStartMining = createRequestThunk({
  request: Api.startMining,
  key: appStartMiningType
})

export const appStopMiningType = 'APP/STOPMINING'
export const appStopMining = createRequestThunk({
  request: Api.stopMining,
  key: appStopMiningType
})

export const appForceMineType = 'APP/FORCEMINE'
export const appForceMine = createRequestThunk({
  request: Api.forceMine,
  key: appForceMineType
})

export const appMakeSnapshotType = 'APP/MAKESNAPSHOT'
export const appMakeSnapshot = createRequestThunk({
  request: Api.makeSnapshot,
  key: appMakeSnapshotType
})

export const appRevertSnapshotType = 'APP/REVERTSNAPSHOT'
export const appRevertSnapshot = createRequestThunk({
  request: Api.revertSnapshot,
  key: appRevertSnapshotType
})

export const appAddAccountType = 'APP/ADDACCOUNT'
export const appAddAccount = createRequestThunk({
  request: Api.addAccount,
  key: appAddAccountType
})

export const appClearLogsType = 'APP/CLEARLOGS'
export const appClearLogs = () => {
  return (dispatch, getState) => {
    dispatch({ type: appClearLogsType })
  }
}

export const appSearchBlockType = 'APP/SEARCHBLOCK'
export const appSearchBlock = createRequestThunk({
  request: Api.searchForBlock,
  key: appSearchBlockType
})

export const appSearchTxType = 'APP/SEARCHTX'
export const appSearchTx = createRequestThunk({
  request: Api.searchForTx,
  key: appSearchTxType
})
