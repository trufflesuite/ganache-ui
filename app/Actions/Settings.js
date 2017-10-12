import { ipcRenderer } from 'electron'

const prefix = 'SETTINGS'

export const SET_SETTINGS = `${prefix}/SET_SETTINGS`
export const setSettings = function(settings) {
  return { type: SET_SETTINGS, settings }
}

export const REQUEST_SAVE_SETTINGS = `${prefix}/REQUEST_SAVE_SETTINGS`
export const requestSaveSettings = function(settings) {
  return function(dispatch, getState) {
    ipcRenderer.send(REQUEST_SAVE_SETTINGS, settings)
  }
}