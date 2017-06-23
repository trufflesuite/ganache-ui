
import BN from 'bn.js'
import EtherUtils from 'ethereumjs-util'

export default class AccountDetailFetcher {
  constructor (stateManager) {
    this.stateManager = stateManager
  }

  async getAccountInfo () {
    let accounts = await Promise.all(Object.keys(this.stateManager.accounts).map(async (address, index) => {
      let latestAccountInfo = await this.getLatestAccountInfo(address)

      return {
        index,
        address: EtherUtils.toChecksumAddress(address),
        balance: new BN(latestAccountInfo.balance).toString(),
        nonce: EtherUtils.bufferToInt(latestAccountInfo.nonce),
        privateKey: this.stateManager.accounts[address].secretKey.toString('hex'),
        isUnlocked: this.stateManager.isUnlocked(address)
      }
    })).catch((err) => {
      console.log(err)
    })

    return accounts
  }

  async getLatestAccountInfo (account) {
    return new Promise((resolve, reject) => {
      this.stateManager.blockchain.getAccount(account, 'latest', (err, res) => {
        if (err) {
          console.log(err)
          reject(err)
        }

        resolve(res)
      })
    }).catch((err) => {
      console.log(err)
    })
  }
}
