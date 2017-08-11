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

export default DefaultState
