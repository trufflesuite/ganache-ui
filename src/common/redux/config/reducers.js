import * as Config from './actions'
import cloneDeep from 'lodash.clonedeep'

const initialState = {
  validationErrors: {}, // of the format {SETTING_NAME (i.e. hosname would be server.hostname): "error text"}
  settings: {},
  configScreenOnly: false
}

export default function (state = initialState, action) {
  let nextState = cloneDeep(state)

  switch (action.type) {
    case Config.SET_SETTINGS:
      // Ignore state; we're overwriting the settings.
      nextState.settings.global = cloneDeep(action.global)
      nextState.settings.workspace = cloneDeep(action.workspace)
      break
    case Config.SET_SETTING_ERROR: 
      if (typeof nextState.validationErrors === "undefined") {
        nextState.validationErrors = {}
      }
      nextState.validationErrors[action.key] = action.errorText
      break
    case Config.CLEAR_SETTING_ERROR:
      if (action.key in nextState.validationErrors) {
        delete nextState.validationErrors[action.key]
      }
      break
    case Config.CLEAR_ALL_SETTING_ERRORS:
      nextState.validationErrors = {}
      break
    case Config.SET_CONFIG_SCREEN_ONLY: {
      nextState.configScreenOnly = action.state
    }
    default:
      break
  }

  return nextState
}