import {
  UPDATE_AVAILABLE,
  DOWNLOAD_PROGRESS,
  UPDATE_DOWNLOADED,
  DOWNLOAD_ERROR,
  setUpdateAvailable,
  setDownloadProgress,
  setUpdateDownloaded,
  setDownloadError
} from '../../Actions/AutoUpdate'

export function initAutoUpdates(ipcRenderer, dispatch) {
  ipcRenderer.on(UPDATE_AVAILABLE, (event, updateInfo) => {
    dispatch(setUpdateAvailable(updateInfo))
  })
  ipcRenderer.on(DOWNLOAD_PROGRESS, (event, progressInfo) => {
    dispatch(setDownloadProgress(progressInfo))
  })
  ipcRenderer.on(UPDATE_DOWNLOADED, (event, path) => {
    dispatch(setUpdateDownloaded())
  })
  ipcRenderer.on(DOWNLOAD_ERROR, (event, errorInfo) => {
    dispatch(setDownloadError(errorInfo))
  })
}
