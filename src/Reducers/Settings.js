import * as Settings from '../Actions/Settings'
import _ from 'lodash'

const initialState = {}

export default function (state = initialState, action) {
  let nextState = _.cloneDeep(state)

  switch (action.type) {
    case Settings.SET_SETTINGS:
      // Ignore state; we're overwriting the settings.
      nextState = _.cloneDeep(action.settings)
      break
    case Settings.SET_SETTING_ERROR: 
      if (typeof nextState.validationErrors === "undefined") {
        nextState.validationErrors = {}
      }
      nextState.validationErrors[action.key] = action.errorText
      break
    case Settings.CLEAR_SETTING_ERROR:
      if (action.key in nextState.validationErrors) {
        delete nextState.validationErrors[action.key]
      }
      break
    case Settings.CLEAR_ALL_SETTING_ERRORS:
      nextState.validationErrors = {}
      break
    default:
      break
  }

  return nextState
}