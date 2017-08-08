const DefaultState = {
  testRpcServerRunning: false,
  accounts: [],
  blocks: [],
  transactions: [],
  snapshots: [],
  currentBlockSearchMatch: null,
  currentTxSearchMatch: null,
  portIsClear: { status: 'clear', pid: [{ name: '' }] }
}

export default DefaultState
