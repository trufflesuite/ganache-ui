function ReduceWith (mutators, defaultState) {
  return function (state = defaultState, action) {
    const mutator = mutators[action.type]

    if (!mutator) {
      return state
    }

    if (mutator instanceof Function) {
      return mutator.call(null, state, action) // eslint-disable-line
    }

    const mutations = Object.keys(mutator).reduce((r, n) => {
      if (mutator[n] instanceof Function) {
        r[n] = mutator[n](action)
      } else {
        r[n] = mutator[n]
      }

      return r
    }, {})

    return {...state, ...mutations}
  }
}

export default ReduceWith
