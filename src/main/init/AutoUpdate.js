import { ipcMain } from 'electron'
import * as AutoUpdate from '../../common/redux/auto-update/actions'

import AutoUpdateService from '../../common/services/AutoUpdateService'

let autoUpdateService = null

export function getAutoUpdateService() {
  return autoUpdateService
}

export function initAutoUpdates(settings, mainWindow) {
  if (!autoUpdateService) {
    const options = getAutoUpdateServiceOptions(settings)
    autoUpdateService = new AutoUpdateService(options)
  }

  autoUpdateService.on('update-available',(updateInfo) => {
    mainWindow.webContents.send(AutoUpdate.UPDATE_AVAILABLE, updateInfo)
  })
  autoUpdateService.on('download-progress',(progressInfo) => {
    mainWindow.webContents.send(AutoUpdate.DOWNLOAD_PROGRESS, progressInfo)
  })
  autoUpdateService.on('update-downloaded',(path) => {
    mainWindow.webContents.send(AutoUpdate.UPDATE_DOWNLOADED)
    setTimeout(() => { autoUpdateService.installAndRelaunch() }, 1000)
  })
  autoUpdateService.on('download-error',(errorInfo) => {
    mainWindow.webContents.send(AutoUpdate.DOWNLOAD_ERROR, {
      message: errorInfo.message || errorInfo.toString(),
      stack: errorInfo.stack || null
    })
  })
  ipcMain.on(AutoUpdate.CANCEL_UPDATE, (event) => {
    autoUpdateService.cancelUpdate()
  })
  ipcMain.on(AutoUpdate.BEGIN_DOWNLOADING, (event) => {
    autoUpdateService.downloadUpdate()
  })
  ipcMain.on(AutoUpdate.INSTALL_AND_RELAUNCH, (event) => {
    autoUpdateService.installAndRelaunch()
  })

  autoUpdateService.checkForUpdates()
}

function getAutoUpdateServiceOptions(settings) {
  let allowPrerelease = !!(settings.updates && settings.updates.allowPrerelease)

  return {
    autoDownload: false,
    allowPrerelease
  }
}
