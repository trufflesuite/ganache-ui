class Module {
  constructor ({name, reducer = null, routes = null}) {
    if (!name) {
      throw new Error('Modules must be given a name.')
    }

    const _name = name.toUpperCase()
    Object.defineProperty(this, 'name', {
      enumerable: true,
      get: () => _name
    })

    const _reducer = reducer
    Object.defineProperty(this, 'reducer', {
      enumerable: true,
      get: () => _reducer
    })
  }
}

export default Module
