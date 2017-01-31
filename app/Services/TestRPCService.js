import TestRPC from 'ethereumjs-testrpc'
import ConversionUtils from 'ethereumjs-testrpc/lib/utils/to'

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

  log = (message) => {
    console.log(message)
    this.webView.send('APP/TESTRPCLOG', {message, level: 'log'})
  }

  info = (message) => {
    console.info(message)
    this.webView.send('APP/TESTRPCLOG', {message, level: 'info'})
  }

  warning = (message) => {
    console.warning(message)
    this.webView.send('APP/TESTRPCLOG', {message, level: 'warning'})
  }

  error = (message) => {
    console.error(message)
    this.webView.send('APP/TESTRPCLOG', {message, level: 'error'})
  }

  _handleStartTestRpc = (event, arg) => {
    arg.logger = this

    this.testRpc = TestRPC.server(arg)
    this.testRpc.listen(arg.port, (err, bkChain) => {
      if (err) {
        this.webView.send('APP/FAILEDTOSTART', err)
        console.log('ERR: ', err)
      }

      const blockChainParams = {
        accounts: Object.keys(bkChain.accounts).map((address, index) => {
          return {
            index,
            address,
            balance: ConversionUtils.number(bkChain.accounts[address].account.balance),
            nonce: ConversionUtils.number(bkChain.accounts[address].account.nonce),
            privateKey: bkChain.accounts[address].secretKey.toString('hex'),
            isUnlocked: bkChain.isUnlocked(address)
          }
        }),
        mnemonic: bkChain.mnemonic,
        hdPath: bkChain.wallet_hdpath,
        gasPrice: bkChain.gasPriceVal,
        totalAccounts: bkChain.total_accounts,
        coinbase: bkChain.coinbase,
        isMiningOnInterval: bkChain.is_mining_on_interval,
        isMining: bkChain.is_mining,
        blocktime: bkChain.blocktime,
        networkId: bkChain.net_version
      }

      this.webView.send('APP/TESTRPCSTARTED', blockChainParams)
      this.blockChain = bkChain
    })
  }

}
