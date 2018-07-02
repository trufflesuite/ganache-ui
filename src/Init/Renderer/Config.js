import { ipcRenderer } from 'electron'

import * as Config from '../../Actions/Config'

export function initConfig(store) {
  ipcRenderer.on(Config.SHOW_CONFIG_SCREEN, (event) => {
    store.dispatch(Config.showConfigScreen())
  })

  ipcRenderer.on(Config.SET_SETTING_ERROR, (event, key, value) => {
    store.dispatch(Config.setSettingError(key, value))
  })

  ipcRenderer.on(Config.CLEAR_SETTING_ERROR, (event, key) => {
    store.dispatch(Config.clearSettingError(key))
  })

  ipcRenderer.on(Config.CLEAR_ALL_SETTING_ERRORS, (event) => {
    store.dispatch(Config.clearAllSettingErrors())
  })

  ipcRenderer.on(Config.SET_SETTINGS, (event, settings) => {
    store.dispatch(Config.setSettings(settings))
  })
}
