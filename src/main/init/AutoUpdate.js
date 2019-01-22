import { ipcMain } from "electron";
import * as AutoUpdate from "../../common/redux/auto-update/actions";

import AutoUpdateService from "../../common/services/AutoUpdateService";

const pkg = require("../../../package.json");

let autoUpdateService = null;

export function getAutoUpdateService() {
  return autoUpdateService;
}

export function initAutoUpdates(settings, mainWindow) {
  if (!autoUpdateService) {
    const options = getAutoUpdateServiceOptions(settings);
    autoUpdateService = new AutoUpdateService(options);
  }

  autoUpdateService.on("checking-for-update", updateInfo => {
    mainWindow.webContents.send(
      AutoUpdate.UPDATE_CHECK_IN_PROGRESS,
      updateInfo,
    );
  });
  autoUpdateService.on("update-not-available", updateInfo => {
    mainWindow.webContents.send(AutoUpdate.UPDATE_CHECK_COMPLETE, updateInfo);
  });
  autoUpdateService.on("update-available", updateInfo => {
    mainWindow.webContents.send(AutoUpdate.UPDATE_CHECK_COMPLETE, updateInfo);
    mainWindow.webContents.send(AutoUpdate.UPDATE_AVAILABLE, updateInfo);
  });
  autoUpdateService.on("download-progress", progressInfo => {
    mainWindow.webContents.send(AutoUpdate.DOWNLOAD_PROGRESS, progressInfo);
  });
  autoUpdateService.on("update-downloaded", () => {
    mainWindow.webContents.send(AutoUpdate.UPDATE_DOWNLOADED);
    setTimeout(() => {
      autoUpdateService.installAndRelaunch();
    }, 1000);
  });
  autoUpdateService.on("download-error", errorInfo => {
    mainWindow.webContents.send(AutoUpdate.DOWNLOAD_ERROR, {
      message: errorInfo.message || errorInfo.toString(),
      stack: errorInfo.stack || null,
    });
  });
  ipcMain.on(AutoUpdate.CANCEL_UPDATE, () => {
    autoUpdateService.cancelUpdate();
  });
  ipcMain.on(AutoUpdate.BEGIN_DOWNLOADING, () => {
    autoUpdateService.downloadUpdate();
  });
  ipcMain.on(AutoUpdate.INSTALL_AND_RELAUNCH, () => {
    autoUpdateService.installAndRelaunch();
  });

  autoUpdateService.checkForUpdates();
}

function getAutoUpdateServiceOptions() {
  let allowPrerelease = pkg.version.match(/-beta/) !== null;

  return {
    autoDownload: false,
    allowPrerelease,
  };
}
