import DefaultState from './DefaultState'

import ReduceWith from 'Data/Sources/ReduceWith'

const mutators = {
  'APP/TESTRPCRUNNING': (state, {type, payload}) => ({
    ...state,
    testRpcServerRunning: true,
    accounts: payload.accounts,
    unlockedAccounts: payload.unlockedAccounts,
    mnemonic: payload.mnemonic,
    hdPath: payload.hdPath,
    gasPrice: payload.gasPrice,
    gasLimit: payload.gasLimit,
    totalAccounts: payload.totalAccounts,
    coinbase: payload.coinbase,
    isMiningOnInterval: payload.isMiningOnInterval,
    isMining: payload.isMining,
    blocktime: payload.blocktime,
    blockNumber: payload.blockNumber,
    snapshots: payload.snapshots,
    blocks: payload.blocks,
    transactions: payload.transactions
  }),

  'APP/BLOCKCHAINSTATE': (state, {type, payload}) => ({
    ...state,
    testRpcServerRunning: true,
    accounts: payload.accounts,
    unlockedAccounts: payload.unlockedAccounts,
    mnemonic: payload.mnemonic,
    hdPath: payload.hdPath,
    gasPrice: payload.gasPrice,
    gasLimit: payload.gasLimit,
    totalAccounts: payload.totalAccounts,
    coinbase: payload.coinbase,
    isMiningOnInterval: payload.isMiningOnInterval,
    isMining: payload.isMining,
    blocktime: payload.blocktime,
    blockNumber: payload.blockNumber,
    snapshots: payload.snapshots,
    blocks: payload.blocks,
    transactions: payload.transactions
  }),

  'APP/TESTRPCLOG': (state, { type, payload }) => ({
    ...state,
    logs: state.logs.concat({ time: new Date().toLocaleTimeString(), message: payload.message })
  }),

  'APP/CLEARLOGS': (state, { type, payload }) => ({
    ...state,
    logs: []
  })
}

export default ReduceWith(mutators, DefaultState)
