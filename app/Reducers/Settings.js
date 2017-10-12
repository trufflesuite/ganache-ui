import * as Settings from 'Actions/Settings'

const initialState = {}

export default function (state = initialState, action) {
  switch (action.type) {
    case Settings.SET_SETTINGS:
      // Ignore state; we're overwriting the settings.
      return Object.assign({}, action.settings)
    default:
      return state
  }
}