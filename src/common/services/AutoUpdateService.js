import EventEmitter from "events";
import { app } from "electron";
import { autoUpdater } from "benjamincburns-forked-electron-updater";
import { CancellationToken } from "builder-util-runtime";
import path from "path";
import merge from "lodash.merge";

const isDevMode = process.execPath.match(/[\\/]electron/);

const defaultOptions = {
  allowPrerelease: false,
  fullChangelog: false,
  autoDownload: false,
};

export default class AutoUpdateService extends EventEmitter {
  constructor(options) {
    super();
    const self = this;

    options = merge({}, defaultOptions, options || {});

    autoUpdater.allowPrerelease = options.allowPrerelease;
    autoUpdater.fullChangelog = options.fullChangelog;
    autoUpdater.autoDownload = options.autoDownload;
    autoUpdater.currentVersion = isDevMode ? "1.0.0" : app.getVersion();

    if (isDevMode) {
      autoUpdater.updateConfigPath = path.join(
        __dirname,
        "..",
        "..",
        "..",
        "dev-app-update.yml",
      );
    }

    this._cancelToken = null;
    this.isCheckingForUpdate = false;
    this.isUpdateAvailable = false;
    this.isDownloadingUpdate = false;
    this.isRestartingForUpdate = false;
    this.updateDownloaded = false;

    autoUpdater.on("checking-for-update", () => {
      self.isCheckingForUpdate = true;
      self.emit("checking-for-update");
    });

    autoUpdater.on("update-not-available", () => {
      self.isCheckingForUpdate = false;
      self.isUpdateAvailable = false;
      self.emit("update-not-available");
    });
    autoUpdater.on("update-available", updateInfo => {
      self.isCheckingForUpdate = false;
      self.isUpdateAvailable = true;
      self.updateVersion = updateInfo.version;
      self.updateReleaseName = updateInfo.releaseName;
      self.updateReleaseNotes = updateInfo.releaseNotes;
      self.emit("update-available", updateInfo);
    });
    autoUpdater.on("update-downloaded", path => {
      self.updateDownloaded = true;
      self._cancelToken = null;
      self.emit("update-downloaded", path);
    });
    autoUpdater.on("error", errorInfo => {
      if (self.isDownloadingUpdate) {
        self.emit("download-error", errorInfo);
      } else {
        self.emit("error", errorInfo);
      }
      self.isCheckingForUpdate = false;
      self.isDownloadingUpdate = false;
    });
    autoUpdater.on("download-progress", progress => {
      self.emit("download-progress", progress);
    });
  }

  checkForUpdates() {
    if (isDevMode) {
      this.emit("checking-for-update");
      this.emit("update-not-available");
    } else {
      let promise = autoUpdater.checkForUpdates();
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
      let promise = autoUpdater.downloadUpdate(this._cancelToken);
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
      let promise = autoUpdater.quitAndInstall(false, true);
      if (promise.catch) {
        // avoid unhandled promise rejection
        // error will be reported from the `error` event handler
        promise.catch(() => {});
      }
    }
  }
}
