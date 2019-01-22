import { ipcRenderer } from "electron";

import {
  SHOW_CONFIG_SCREEN,
  SET_SETTING_ERROR,
  CLEAR_SETTING_ERROR,
  CLEAR_ALL_SETTING_ERRORS,
  SET_SETTINGS,
  showConfigScreen,
  setSettingError,
  clearSettingError,
  clearAllSettingErrors,
  setSettings,
} from "../../common/redux/config/actions";

export function initConfig(store) {
  ipcRenderer.on(SHOW_CONFIG_SCREEN, () => {
    store.dispatch(showConfigScreen());
  });

  ipcRenderer.on(SET_SETTING_ERROR, (event, key, value) => {
    store.dispatch(setSettingError(key, value));
  });

  ipcRenderer.on(CLEAR_SETTING_ERROR, (event, key) => {
    store.dispatch(clearSettingError(key));
  });

  ipcRenderer.on(CLEAR_ALL_SETTING_ERRORS, () => {
    store.dispatch(clearAllSettingErrors());
  });

  ipcRenderer.on(SET_SETTINGS, (event, globalSettings, workspaceSettings) => {
    store.dispatch(setSettings(globalSettings, workspaceSettings));
  });
}
