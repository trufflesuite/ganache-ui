import TestRPC from 'ethereumjs-testrpc'

import { ipcRenderer } from 'electron'

export default class TestRPCService {
  constructor (ipcMain, webView) {
    this.ipcMain = ipcMain
    this.webView = webView

    this.testRpc = null
    this.blockChain = null

    console.log('Starting TestRPCService')

    ipcMain.on('APP/STARTRPC', this._handleStartTestRpc)
  }

  _handleStartTestRpc = (event, arg) => {
    console.log(event, arg)
    this.testRpc = TestRPC.server()
    this.testRpc.listen(8545, (err, bkChain) => {
      if (err) {
        this.webView.send('APP/FAILEDTOSTART', err)
        console.log('ERR: ', err)
      }

      this.webView.send('APP/TESTRPCSTARTED')
      this.blockChain = bkChain
    })
  }

}
