import { ipcRenderer } from 'electron'
import { push } from 'react-router-redux'

const prefix = 'SETTINGS'

export const SHOW_CONFIG_SCREEN = `${prefix}/SHOW_CONFIG_SCREEN`
export function showConfigScreen(tab) {
  return push("/config" + (tab ? ("/" + tab) : ""))
}

export const SET_SETTINGS = `${prefix}/SET_SETTINGS`
export const setSettings = function(globalSettings, workspaceSettings) {
  return function(dispatch, getState) {
    // Save settings to the store
    dispatch({
      type: SET_SETTINGS,
      global: globalSettings,
      workspace: workspaceSettings
    })
  }
}

export const REQUEST_SAVE_SETTINGS = `${prefix}/REQUEST_SAVE_SETTINGS`
export const requestSaveSettings = function(globalSettings, workspaceSettings) {
  return function(dispatch, getState) {
    ipcRenderer.send(REQUEST_SAVE_SETTINGS, globalSettings, workspaceSettings)
  }
}

export const SET_SETTING_ERROR = `${prefix}/SET_SETTING_ERROR`
export const setSettingError = function(key, errorText) {
  return {type: SET_SETTING_ERROR, key, errorText};
}

export const CLEAR_SETTING_ERROR = `${prefix}/CLEAR_SETTING_ERROR`
export const clearSettingError = function(key) {
  return {type: CLEAR_SETTING_ERROR, key}
}

export const CLEAR_ALL_SETTING_ERRORS = `${prefix}/CLEAR_ALL_SETTING_ERRORS`
export const clearAllSettingErrors = function() {
  return {type: CLEAR_ALL_SETTING_ERRORS}
}

export const SET_CONFIG_SCREEN_ONLY = `${prefix}/SET_CONFIG_SCREEN_ONLY`
export const setConfigScreenOnly = function(state) {
  return {type: SET_CONFIG_SCREEN_ONLY, state}
}
