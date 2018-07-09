import { ipcRenderer } from 'electron'

const prefix = 'SETTINGS'

export const SET_SETTINGS = `${prefix}/SET_SETTINGS`
export const setSettings = function(globalSettings, workspaceSettings) {
  return function(dispatch, getState) {
    // Save settinsg to the store
    dispatch({
      type: SET_SETTINGS,
      global: globalSettings,
      workspace: workspaceSettings
    })

    // Then save them to to the settings file
    dispatch(requestSaveSettings(globalSettings, workspaceSettings))
  }
}

export const REQUEST_SAVE_SETTINGS = `${prefix}/REQUEST_SAVE_SETTINGS`
export const requestSaveSettings = function(globalSettings, workspaceSettings) {
  return function(dispatch, getState) {
    ipcRenderer.send(REQUEST_SAVE_SETTINGS, globalSettings, workspaceSettings)
  }
}