const Core = require("./actions");

const initialState = {
  started: false,
  systemError: null,
  showBugModal: false,
  modalError: null,
  updateInfo: {}
};

export default function (state = initialState, action) {
  state = {...initialState, ...state};
  switch (action.type) {
    case Core.SET_SERVER_STARTED:
      return Object.assign({}, state, {
        started: true,
      });

    case Core.SET_SYSTEM_ERROR:
      return Object.assign({}, state, {
        systemError: action.error,
        showBugModal: action.showBugModal,
      });
    case Core.SET_PROGRESS:
      return Object.assign({}, state, {
        progress: action.message,
        minDuration: action.minDuration
      });
    case Core.SET_MODAL_ERROR:
      return Object.assign({}, state, {
        modalError: action.error,
      });

    case Core.DISMISS_MODAL_ERROR:
      return Object.assign({}, state, {
        modalError: null,
      });

    case Core.SET_NEW_VERSION_INFO:
      return Object.assign({}, state, {
        updateInfo: {
          newVersion: action.newVersion,
          releaseNotes: action.releaseNotes,
        },
      });

    default:
      return state;
  }
}
