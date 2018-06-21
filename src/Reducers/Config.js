import * as Config from '../Actions/Config'
import _ from 'lodash'

const initialState = {
  validationErrors: {}, // of the format {SETTING_NAME (i.e. hosname would be server.hostname): "error text"}
  settings: {}
}

export default function (state = initialState, action) {
  let nextState = _.cloneDeep(state)

  switch (action.type) {
    case Config.SET_SETTINGS:
      // Ignore state; we're overwriting the settings.
      nextState.settings = _.cloneDeep(action.settings)
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
    default:
      break
  }

  return nextState
}