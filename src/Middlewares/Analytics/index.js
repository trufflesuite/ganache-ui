import * as GoogleAnalytics from './Engines/GoogleAnalytics'

const engines = [GoogleAnalytics]

export function processAction({ getState }) {
  return next => action => {
    engines.forEach((engine, index) => {
      engine.process(action, getState())
    })

    const returnValue = next(action)

    return returnValue
  }
}

export function processPage(path, state) {
  engines.forEach((engine, index) => {
    engine.processPage(path, state)
  })
}