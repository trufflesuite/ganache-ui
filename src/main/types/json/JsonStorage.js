import { LocalStorage } from "node-localstorage";

import JsonWithKeyPaths from "./JsonWithKeyPaths";

class JsonStorage {
  constructor(directory, name, obj) {
    this.obj = new JsonWithKeyPaths(obj);
    this.name = name;
    this.setStorageDirectory(directory);
  }

  setStorageDirectory(directory) {
    this.directory = directory;
    this.storage = new LocalStorage(this.directory);
  }

  getFromStorage() {
    const data = JSON.parse(this.storage.getItem(this.name));
    this.obj.setAll(data);
    return data;
  }

  // if defaultValue is set, and neither the cache nor storage has the key
  //   the cache and storage will be set to the defaultValue
  get(key, defaultValue = null) {
    if (this.obj.has(key)) {
      return this.obj.get(key);
    } else {
      // check storage
      this.getFromStorage();
      // we use this.obj again because getFromStorage refreshes the cache
      if (this.obj.has(key)) {
        return this.obj.get(key);
      } else if (defaultValue !== null) {
        this.set(key, defaultValue);
        return defaultValue;
      } else {
        return undefined;
      }
    }
  }

  getAll() {
    return this.getFromStorage();
  }

  setToStorage() {
    this.storage.setItem(this.name, JSON.stringify(this.obj.obj));
  }

  set(key, value) {
    this.obj.set(key, value);
    this.setToStorage();
  }

  setAll(value) {
    this.obj.setAll(value);
    this.setToStorage();
  }
}

export default JsonStorage;
