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

    const _routes = routes
    Object.defineProperty(this, 'routes', {
      enumerable: true,
      get: () => _routes
    })
  }

  submoduleOf (parentModuleName) {
    this.parent = parentModuleName.toUpperCase()
  }
}

export default Module
