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

export function initAutoUpdates(actionClient, dispatch) {
  actionClient.on(UPDATE_AVAILABLE, (event, updateInfo) => {
    dispatch(setUpdateAvailable(updateInfo))
  })
  actionClient.on(DOWNLOAD_PROGRESS, (event, progressInfo) => {
    dispatch(setDownloadProgress(progressInfo))
  })
  actionClient.on(UPDATE_DOWNLOADED, (event, path) => {
    dispatch(setUpdateDownloaded())
  })
  actionClient.on(DOWNLOAD_ERROR, (event, errorInfo) => {
    dispatch(setDownloadError(errorInfo))
  })
}
