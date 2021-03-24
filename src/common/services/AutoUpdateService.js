import EventEmitter from "events";
import log from "electron-log";
import { CancellationToken } from "builder-util-runtime";
import merge from "lodash.merge";

// Do not change this import syntax; it's necessary
// for rollup: https://git.io/JYedE
const ElectronUpdater = require("electron-updater");

const isDevMode = process.execPath.match(/[\\/]electron/);
const defaultOptions = {
  autoDownload: false
};

export default class AutoUpdateService extends EventEmitter {
  constructor(options) {
    super();
    const self = this;

    options = merge({}, defaultOptions, options || {});
    log.transports.file.level = "debug";
    ElectronUpdater.autoUpdater.logger = log;
    ElectronUpdater.autoUpdater.autoDownload = options.autoDownload;

    this._cancelToken = null;
    this.isCheckingForUpdate = false;
    this.isUpdateAvailable = false;
    this.isDownloadingUpdate = false;
    this.isRestartingForUpdate = false;
    this.updateDownloaded = false;

    ElectronUpdater.autoUpdater.on("checking-for-update", () => {
      self.isCheckingForUpdate = true;
      self.emit("checking-for-update");
    });

    ElectronUpdater.autoUpdater.on("update-not-available", () => {
      self.isCheckingForUpdate = false;
      self.isUpdateAvailable = false;
      self.emit("update-not-available");
    });
    ElectronUpdater.autoUpdater.on("update-available", updateInfo => {
      self.isCheckingForUpdate = false;
      self.isUpdateAvailable = true;
      self.updateVersion = updateInfo.version;
      self.updateReleaseName = updateInfo.releaseName;
      self.updateReleaseNotes = updateInfo.releaseNotes;
      self.emit("update-available", updateInfo);
    });
    ElectronUpdater.autoUpdater.on("update-downloaded", path => {
      self.updateDownloaded = true;
      self._cancelToken = null;
      self.emit("update-downloaded", path);
    });
    ElectronUpdater.autoUpdater.on("error", errorInfo => {
      if (self.isDownloadingUpdate) {
        self.emit("download-error", errorInfo);
      } else {
        self.emit("error", errorInfo);
      }
      self.isCheckingForUpdate = false;
      self.isDownloadingUpdate = false;
    });
    ElectronUpdater.autoUpdater.on("download-progress", progress => {
      self.emit("download-progress", progress);
    });
  }

  checkForUpdates() {
    if (isDevMode) {
      this.emit("checking-for-update");
      this.emit("update-not-available");
    } else {
      let promise = ElectronUpdater.autoUpdater.checkForUpdates();
      if (promise.catch) {
        // avoid unhandled promise rejection
        // error will be reported from the `error` event handler
        promise.catch(() => {});
      }
    }
  }

  downloadUpdate() {
    if (!isDevMode) {
      this.isDownloadingUpdate = true;
      if (this._cancelToken) {
        this._cancelToken.cancel();
      }
      this._cancelToken = new CancellationToken();
      let promise = ElectronUpdater.autoUpdater.downloadUpdate(this._cancelToken);
      if (promise.catch) {
        // avoid unhandled promise rejection
        // error will be reported from the `error` event handler
        promise.catch(() => {});
      }
    }
  }

  cancelUpdate() {
    if (this._cancelToken) {
      this._cancelToken.cancel();
      this._cancelToken = null;
      this.isDownloadingUpdate = false;
    }
  }

  installAndRelaunch() {
    if (!isDevMode && this.updateDownloaded) {
      this.restartingForUpdate = true;
      let promise = ElectronUpdater.autoUpdater.quitAndInstall(false, true);
      if (promise.catch) {
        // avoid unhandled promise rejection
        // error will be reported from the `error` event handler
        promise.catch(() => {});
      }
    }
  }
}
