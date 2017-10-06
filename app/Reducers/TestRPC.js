const DefaultState = {
  testRpcServerRunning: false,
  accounts: [],
  blocks: [],
  transactions: [],
  snapshots: [],
  currentBlockSearchMatch: null,
  currentTxSearchMatch: null,
  ganachePortStatus: { status: 'clear', pid: [{ name: '' }] },
  systemError: null
}

import ReduceWith from 'Data/Sources/ReduceWith'

const mutators = {
  'APP/TESTRPCRUNNING': (state, { type, payload }) => ({
    ...state,
    testRpcServerRunning: true,
    ...payload
  }),

  'APP/BLOCKCHAINSTATE': (state, { type, payload }) => ({
    ...state,
    testRpcServerRunning: true,
    ...payload
  }),

  'APP/BLOCKSEARCHRESULT': (state, { type, payload }) => ({
    ...state,
    currentBlockSearchMatch: payload
  }),

  'APP/TXSEARCHRESULT': (state, { type, payload }) => ({
    ...state,
    currentTxSearchMatch: payload
  }),

  'APP/CHECKPORTRESULT': (state, { type, payload }) => ({
    ...state,
    ganachePortStatus: payload
  }),

  'APP/FATALERROR': (state, { type, payload }) => ({
    ...state,
    systemError: payload
  })
}

export default ReduceWith(mutators, DefaultState)
