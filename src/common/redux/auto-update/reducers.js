import * as AutoUpdate from "./actions";

const initialState = {
  downloadComplete: false,
  downloadInProgress: false,
  isRestartingForUpdate: false,
  updateCheckInProgress: false,
  isNewVersionAvailable: false,
  versionInfo: {
    newVersion: "",
    releaseName: "",
    releaseNotes: "",
  },
  downloadProgress: {
    bytesPerSecond: 0,
    percent: 0,
    total: 0,
    transferred: 0,
  },
  downloadError: null,
};

export default function(state = initialState, action) {
  switch (action.type) {
    case AutoUpdate.UPDATE_CHECK_IN_PROGRESS:
      return Object.assign({}, initialState, state, {
        updateCheckInProgress: true,
      });
    case AutoUpdate.UPDATE_CHECK_COMPLETE:
      return Object.assign({}, initialState, state, {
        updateCheckInProgress: false,
      });
    case AutoUpdate.UPDATE_AVAILABLE:
      return Object.assign({}, initialState, state, {
        isNewVersionAvailable: true,
        versionInfo: {
          newVersion: action.newVersion,
          releaseName: action.releaseName,
          releaseNotes: action.releaseNotes,
        },
      });
    case AutoUpdate.BEGIN_DOWNLOADING:
      return Object.assign({}, initialState, state, {
        isRestartingForUpdate: false,
        downloadComplete: false,
        downloadInProgress: true,
        downloadError: null,
        downloadProgress: {
          bytesPerSecond: initialState.downloadProgress.bytesPerSecond,
          percent: initialState.downloadProgress.percent,
          total: initialState.downloadProgress.total,
          transferred: initialState.downloadProgress.transferred,
        },
      });
    case AutoUpdate.DOWNLOAD_PROGRESS:
      return Object.assign({}, initialState, state, {
        downloadComplete: action.percent == 100,
        downloadInProgress: true,
        downloadProgress: {
          bytesPerSecond: action.bytesPerSecond,
          percent: action.percent,
          total: action.total,
          transferred: action.transferred,
        },
      });
    case AutoUpdate.DOWNLOAD_ERROR:
      return Object.assign({}, initialState, state, {
        downloadComplete: false,
        downloadInProgress: false,
        downloadError: action.errorInfo,
        // don't clear progress so that progress bar can show where it failed
      });
    case AutoUpdate.UPDATE_DOWNLOADED:
      return Object.assign({}, initialState, state, {
        downloadComplete: true,
        downloadInProgress: false,
        downloadProgress: {
          bytesPerSecond: 0,
          percent: 100,
          total: state.downloadProgress.total,
          transferred: state.downloadProgress.total,
        },
      });
    case AutoUpdate.INSTALL_AND_RELAUNCH:
      return Object.assign({}, initialState, state, {
        isRestartingForUpdate: true,
      });
    case AutoUpdate.SHOW_UPDATE_MODAL:
      return Object.assign({}, initialState, state, {
        downloadError: false,
        showModal: true,
      });
    case AutoUpdate.CANCEL_UPDATE:
      return Object.assign({}, initialState, state, {
        isRestartingForUpdate: false,
        downloadComplete: false,
        downloadInProgress: false,
        showModal: false,
        downloadProgress: {
          bytesPerSecond: initialState.downloadProgress.bytesPerSecond,
          percent: initialState.downloadProgress.percent,
          total: initialState.downloadProgress.total,
          transferred: initialState.downloadProgress.transferred,
        },
      });
    default:
      if (!state || !state.downloadProgress) {
        return Object.assign({}, initialState, state || {});
      } else {
        return state;
      }
  }
}
