import TestRPC from 'ethereumjs-testrpc'

export default class TestRPCService {
  constructor (ipcMain) {
    this.ipcMain = ipcMain

    this.testRpc = null
    this.blockChain = null

    console.log('Starting TestRPCService')

    ipcMain.on('APP/STARTRPC', this._handleStartTestRpc)
  }

  _handleStartTestRpc = (event, arg) => {
    console.log(event, arg)
    this.testRpc = TestRPC.server()
    this.testRpc.listen(8454, (err, bkChain) => {
      console.log('ERR: ', err)
      console.log(bkChain)
      this.blockChain = bkChain
    })
  }

}
