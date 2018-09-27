

class JsonWithKeyPaths {
  constructor(obj) {
    this.obj = obj || {}
  }

  get(keyPath) {
    const keys = keyPath.split(".")

    let tempObj = this.obj
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]

      if (key in tempObj) {
        tempObj = tempObj[key]
      } else {
        return undefined
      }
    }

    return tempObj
  }

  getAll() {
    return this.obj
  }

  set(keyPath, value) {
    const keys = keyPath.split(".")

    let tempObj = this.obj
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]

      if (!(key in tempObj)) {
        tempObj[key] = {}
      }

      tempObj = tempObj[key]
    }

    tempObj[keys.shift()] = value
  }

  setAll(value) {
    this.obj = value
  }

  has(keyPath) {
    const keys = keyPath.split(".")

    return typeof this.get(keyPath) !== "undefined"
  }

  delete(keyPath) {
    const keys = keyPath.split(".")

    let tempObj = this.obj
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]

      if (!(key in tempObj)) {
        return
      }

      tempObj = tempObj[key]
    }

    const lastKey = keys.shift()
    if (lastKey in tempObj) {
      delete tempObj[lastKey]
    }
  }
}

export default JsonWithKeyPaths