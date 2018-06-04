import * as Settings from '../Actions/Settings'

const initialState = {}

export default function (state = initialState, action) {
  let nextState = JSON.parse(JSON.stringify(state))

  switch (action.type) {
    case Settings.SET_SETTINGS:
      // Ignore state; we're overwriting the settings.
      nextState = JSON.parse(JSON.stringify(action.settings))
      break;
    case Settings.SET_SETTING_ERROR: 
      nextState.validationErrors[action.key] = action.errorText
      break;
    case Settings.CLEAR_SETTING_ERROR:
      delete nextState.validationErrors[action.key]
      break;
    default:
      break;
  }

  return nextState
}