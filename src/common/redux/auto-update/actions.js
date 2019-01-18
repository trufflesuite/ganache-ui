import { ipcRenderer } from "electron";
const prefix = "UPDATE";

export const SHOW_UPDATE_MODAL = `${prefix}/SHOW_UPDATE_MODAL`;
export const showUpdateModal = function() {
  return function(dispatch) {
    dispatch({ type: SHOW_UPDATE_MODAL });
  };
};

export const CANCEL_UPDATE = `${prefix}/CANCEL_UPDATE`;
export const cancelUpdate = function() {
  return function(dispatch) {
    dispatch({ type: CANCEL_UPDATE });
    ipcRenderer.send(CANCEL_UPDATE);
  };
};

export const UPDATE_CHECK_IN_PROGRESS = `${prefix}/UPDATE_CHECK_IN_PROGRESS`;
export const setUpdateCheckInProgress = function() {
  return function(dispatch) {
    dispatch({ type: UPDATE_CHECK_IN_PROGRESS });
  };
};

export const UPDATE_CHECK_COMPLETE = `${prefix}/UPDATE_CHECK_COMPLETE`;
export const setUpdateCheckComplete = function() {
  return function(dispatch) {
    dispatch({ type: UPDATE_CHECK_COMPLETE });
  };
};

export const UPDATE_AVAILABLE = `${prefix}/UPDATE_AVAILABLE`;
export const setUpdateAvailable = function(
  newVersion,
  releaseName,
  releaseNotes,
) {
  if (releaseName === undefined && releaseNotes === undefined) {
    let updateInfo = newVersion;
    newVersion = updateInfo.version;
    releaseName = updateInfo.releaseName;
    releaseNotes = updateInfo.releaseNotes;
  }
  return function(dispatch) {
    dispatch({ type: UPDATE_AVAILABLE, newVersion, releaseName, releaseNotes });
  };
};

export const DOWNLOAD_PROGRESS = `${prefix}/DOWNLOAD_PROGRESS`;
export const setDownloadProgress = function(
  bytesPerSecond,
  percent,
  total,
  transferred,
) {
  if (
    percent === undefined &&
    total === undefined &&
    transferred === undefined
  ) {
    let progressInfo = bytesPerSecond;
    bytesPerSecond = progressInfo.bytesPerSecond;
    percent = progressInfo.percent;
    total = progressInfo.total;
    transferred = progressInfo.transferred;
  }

  return function(dispatch) {
    dispatch({
      type: DOWNLOAD_PROGRESS,
      bytesPerSecond,
      percent,
      total,
      transferred,
    });
  };
};

export const UPDATE_DOWNLOADED = `${prefix}/UPDATE_DOWNLOADED`;
export const setUpdateDownloaded = function() {
  return function(dispatch) {
    dispatch({ type: UPDATE_DOWNLOADED });
  };
};

export const DOWNLOAD_ERROR = `${prefix}/DOWNLOAD_ERROR`;
export const setDownloadError = function(errorInfo) {
  return function(dispatch) {
    dispatch({ type: DOWNLOAD_ERROR, errorInfo });
  };
};

export const BEGIN_DOWNLOADING = `${prefix}/BEGIN_DOWNLOADING`;
export const beginDownloading = function() {
  return function(dispatch) {
    dispatch({ type: BEGIN_DOWNLOADING });
    ipcRenderer.send(BEGIN_DOWNLOADING);
  };
};

export const INSTALL_AND_RELAUNCH = `${prefix}/INSTALL_AND_RELAUNCH`;
export const installAndRelaunch = function() {
  return function(dispatch) {
    dispatch({ type: INSTALL_AND_RELAUNCH });
    ipcRenderer.send(INSTALL_AND_RELAUNCH);
  };
};
