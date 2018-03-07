import actionClient from '../Kernel/actionClient'

const prefix = 'SETTINGS'

export const SET_SETTINGS = `${prefix}/SET_SETTINGS`
export const setSettings = function(settings) {
  return function(dispatch, getState) {
    // Save settinsg to the store
    dispatch({ type: SET_SETTINGS, settings })

    // Then save them to to the settings file
    dispatch(requestSaveSettings(settings))
  }
}

export const REQUEST_SAVE_SETTINGS = `${prefix}/REQUEST_SAVE_SETTINGS`
export const requestSaveSettings = function(settings) {
  return function(dispatch, getState) {
    actionClient.send(REQUEST_SAVE_SETTINGS, settings)
  }
}
