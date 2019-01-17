import JsonStorage from "../json/JsonStorage";

class ContractCache {
  constructor(directory) {
    this.storage = new JsonStorage(directory, "ContractCache");

    let obj = this.storage.getAll();
    if (obj === null || typeof obj !== "object") {
      this.storage.setAll({});
    }
  }

  setDirectory(directory) {
    this.storage.setStorageDirectory(directory);
  }

  get(address) {
    return this.storage.get(address);
  }

  getTransactions(address) {
    return this.storage.get(address + ".transactions");
  }

  getEvents(address) {
    return this.storage.get(address + ".events");
  }

  clear(address) {
    let obj = this.storage.getAll();

    if (obj[address]) {
      delete obj[address];
      this.storage.setAll(obj);
    }
  }

  addContract(address) {
    let obj = this.get(address);

    let changeObj = false;
    if (typeof obj === "undefined") {
      obj = {};
      changeObj = true;
    }
    if (typeof obj.transactions === "undefined") {
      obj.transactions = [];
      changeObj = true;
    }
    if (typeof obj.events === "undefined") {
      obj.events = [];
      changeObj = true;
    }

    if (changeObj) {
      this.storage.set(address, obj);
    }
  }

  addTransaction(address, transactionHash) {
    this.addContract(address);
    let obj = this.getTransactions(address);

    if (typeof obj === "undefined") {
      obj = [];
    }

    if (obj.indexOf(transactionHash) === -1) {
      obj.push(transactionHash);

      this.storage.set(address + ".transactions", obj);
    }
  }

  addEvent(address, event) {
    this.addContract(address);
    let obj = this.getEvents(address);

    if (typeof obj === "undefined") {
      obj = [];
    }

    const existingEventsInCache = obj.filter(e => {
      return (
        e.transactionHash === event.transactionHash &&
        e.logIndex === event.logIndex
      );
    });

    if (existingEventsInCache.length === 0) {
      obj.push(event);

      this.storage.set(address + ".events", obj);
    }
  }

  getAll() {
    return this.storage.getAll() || {};
  }

  setAll(obj) {
    return this.storage.setAll(obj);
  }
}

export default ContractCache;
