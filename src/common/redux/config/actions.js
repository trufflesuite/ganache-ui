import { ipcRenderer } from "electron";
import { push } from "react-router-redux";

const prefix = "SETTINGS";

export const SHOW_CONFIG_SCREEN = `${prefix}/SHOW_CONFIG_SCREEN`;
export function showConfigScreen(tab) {
  return push("/config" + (tab ? "/" + tab : ""));
}

export const SET_SETTINGS = `${prefix}/SET_SETTINGS`;
export const setSettings = function(globalSettings, workspaceSettings) {
  return function(dispatch) {
    // Save settings to the store
    dispatch({
      type: SET_SETTINGS,
      global: globalSettings,
      workspace: workspaceSettings,
    });
  };
};

export const REQUEST_SAVE_SETTINGS = `${prefix}/REQUEST_SAVE_SETTINGS`;
export const requestSaveSettings = function(globalSettings, workspaceSettings) {
  return function() {
    ipcRenderer.send(REQUEST_SAVE_SETTINGS, globalSettings, workspaceSettings);
  };
};

export const SET_SETTING_ERROR = `${prefix}/SET_SETTING_ERROR`;
export const setSettingError = function(key, errorText) {
  return { type: SET_SETTING_ERROR, key, errorText };
};

export const CLEAR_SETTING_ERROR = `${prefix}/CLEAR_SETTING_ERROR`;
export const clearSettingError = function(key) {
  return { type: CLEAR_SETTING_ERROR, key };
};

export const CLEAR_ALL_SETTING_ERRORS = `${prefix}/CLEAR_ALL_SETTING_ERRORS`;
export const clearAllSettingErrors = function() {
  return { type: CLEAR_ALL_SETTING_ERRORS };
};

export const STARTUP_MODE = {
  NORMAL: 0,
  NEW_WORKSPACE: 1,
  SAVING_WORKSPACE: 2,
};

export const SET_STARTUP_MODE = `${prefix}/SET_STARTUP_MODE`;
export const setStartupMode = function(mode) {
  return { type: SET_STARTUP_MODE, mode };
};
