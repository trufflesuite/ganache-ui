class JsonWithKeyPaths {
  constructor(obj) {
    this.obj = obj || {};
  }

  get(keyPath) {
    const keys = keyPath.split(".");

    let tempObj = this.obj;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      if (
        tempObj !== null &&
        typeof tempObj !== "undefined" &&
        typeof tempObj[key] !== "undefined"
      ) {
        tempObj = tempObj[key];
      } else {
        return undefined;
      }
    }

    return tempObj;
  }

  getAll() {
    return this.obj;
  }

  set(keyPath, value) {
    const keys = keyPath.split(".");

    let tempObj = this.obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];

      if (
        tempObj !== null &&
        typeof tempObj !== "undefined" &&
        typeof tempObj[key] === "undefined"
      ) {
        tempObj[key] = {};
      }

      tempObj = tempObj[key];
    }

    tempObj[keys.pop()] = value;
  }

  setAll(value) {
    this.obj = value;
  }

  has(keyPath) {
    return typeof this.get(keyPath) !== "undefined";
  }

  delete(keyPath) {
    const keys = keyPath.split(".");

    let tempObj = this.obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];

      if (
        tempObj !== null &&
        typeof tempObj !== "undefined" &&
        typeof tempObj[key] === "undefined"
      ) {
        return;
      }

      tempObj = tempObj[key];
    }

    const lastKey = keys.pop();
    if (
      tempObj !== null &&
      typeof tempObj !== "undefined" &&
      typeof tempObj[lastKey] !== "undefined"
    ) {
      delete tempObj[lastKey];
    }
  }
}

export default JsonWithKeyPaths;
