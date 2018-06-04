import { ipcRenderer } from 'electron'
import { push } from 'react-router-redux'

const prefix = 'SETTINGS'

export const SHOW_CONFIG_SCREEN = `${prefix}/SHOW_CONFIG_SCREEN`
export function showConfigScreen() {
  return function(dispatch, getState) {
    dispatch(push("/config"))
  }
}

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
    ipcRenderer.send(REQUEST_SAVE_SETTINGS, settings)
  }
}

export const SET_SETTING_ERROR = `${prefix}/SET_SETTING_ERROR`
export const setSettingError = function(key, errorText) {
  return {type: SET_SETTING_ERROR, key, errorText};
}

export const CLEAR_SETTING_ERROR = `${prefix}/CLEAR_SETTING_ERROR`
export const clearSettingError = function(key) {
  return {type: CLEAR_SETTING_ERROR, key};
}