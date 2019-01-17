import { ipcRenderer } from "electron";

import {
  UPDATE_CHECK_IN_PROGRESS,
  UPDATE_CHECK_COMPLETE,
  UPDATE_AVAILABLE,
  DOWNLOAD_PROGRESS,
  UPDATE_DOWNLOADED,
  DOWNLOAD_ERROR,
  setUpdateCheckInProgress,
  setUpdateCheckComplete,
  setUpdateAvailable,
  setDownloadProgress,
  setUpdateDownloaded,
  setDownloadError,
} from "../../common/redux/auto-update/actions";

export function initAutoUpdates(store) {
  ipcRenderer.on(UPDATE_AVAILABLE, (event, updateInfo) => {
    store.dispatch(setUpdateAvailable(updateInfo));
  });
  ipcRenderer.on(DOWNLOAD_PROGRESS, (event, progressInfo) => {
    store.dispatch(setDownloadProgress(progressInfo));
  });
  ipcRenderer.on(UPDATE_DOWNLOADED, (event, path) => {
    store.dispatch(setUpdateDownloaded());
  });
  ipcRenderer.on(DOWNLOAD_ERROR, (event, errorInfo) => {
    store.dispatch(setDownloadError(errorInfo));
  });
}
