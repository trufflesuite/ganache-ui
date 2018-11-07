import JsonStorage from '../json/JsonStorage'

class ContractCache {
  constructor(directory) {
    this.storage = new JsonStorage(directory, 'ContractCache')

    let obj = this.storage.getAll()
    if (typeof obj !== "object") {
      this.storage.setAll({})
    }
  }

  setDirectory(directory) {
    this.storage.setStorageDirectory(directory)
  }

  get(address) {
    return this.storage.get(address)
  }

  getTransactions(address) {
    return this.storage.get(address + ".transactions")
  }

  getEvents(address) {
    return this.storage.get(address + ".events")
  }

  clear(address) {
    let obj = this.storage.getAll()

    if (obj[address]) {
      delete obj[address]
      this.storage.setAll(obj)
    }
  }

  addContract(address) {
    this.storage.set(address, {
      transactions: [],
      events: []
    })
  }

  addTransaction(address, transactionHash) {
    let obj = this.getTransactions(address)

    if (typeof obj === "undefined") {
      obj = []
    }

    if (obj.indexOf(transactionHash) === -1) {
      obj.push(transactionHash)

      this.storage.set(address + ".transactions", obj)
    }
  }

  addEvent(address, event) {
    let obj = this.getEvents(address)

    if (typeof obj === "undefined") {
      obj = []
    }

    obj.push(event)

    this.storage.set(address + ".events", obj)
  }

  getAll() {
    return this.storage.getAll() || {}
  }

  setAll(obj) {
    return this.storage.setAll(obj)
  }
}

export default ContractCache