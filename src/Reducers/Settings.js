import * as Settings from '../Actions/Settings'

const initialState = {}

export default function (state = initialState, action) {
  switch (action.type) {
    case Settings.SET_SETTINGS:
      // Ignore state; we're overwriting the settings.
      return Object.assign({}, action.settings)
    case Settings.SET_SETTING_ERROR:
      let nextState = Object.assign({}, state)
      nextState.validationErrors[action.key] = action.errorText
      return nextState
    case Settings.CLEAR_SETTING_ERROR:
      let nextState = Object.assign({}, state)
      delete nextState.validationErrors[action.key]
      return nextState
    default:
      return state
  }
}