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
  key: appStartMiningType,
  success: []
})

export const appStopMiningType = 'APP/STOPMINING'
export const appStopMining = createRequestThunk({
  request: Api.stopMining,
  key: appStopMiningType,
  success: []
})

export const appForceMineType = 'APP/FORCEMINE'
export const appForceMine = createRequestThunk({
  request: Api.forceMine,
  key: appForceMineType,
  success: []
})

export const appMakeSnapshotType = 'APP/MAKESNAPSHOT'
export const appMakeSnapshot = createRequestThunk({
  request: Api.makeSnapshot,
  key: appMakeSnapshotType,
  success: []
})

export const appRevertSnapshotType = 'APP/REVERTSNAPSHOT'
export const appRevertSnapshot = createRequestThunk({
  request: Api.revertSnapshot,
  key: appRevertSnapshotType,
  success: []
})

export const appAddAccountType = 'APP/ADDACCOUNT'
export const appAddAccount = createRequestThunk({
  request: Api.addAccount,
  key: appAddAccountType,
  success: []
})
