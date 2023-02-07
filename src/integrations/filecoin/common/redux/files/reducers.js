import * as Files from "./actions";
import clonedeep from "lodash.clonedeep";

const initialState = {
  inView: [],
};

export default function(state = initialState, action) {
  switch (action.type) {
    case Files.CLEAR_FILES_IN_VIEW:
      return Object.assign({}, state, {
        inView: [],
      });

    case Files.ADD_FILES_TO_VIEW: {
      const nextState = clonedeep(state);

      nextState.inView = action.files;

      return nextState;
    }

    case Files.FILE_DOWNLOAD_PROGRESS: {
      const nextState = clonedeep(state);

      const file = nextState.inView.find(f => f.cid.toString() === action.cid.toString());

      if (file) {
        if (!file.download) {
          file.download = {};
        }

        file.download.progress = action.progress;
      }

      return nextState;
    }

    case Files.FILE_DOWNLOAD_ERROR: {
      const nextState = clonedeep(state);

      const file = nextState.inView.find(f => f.cid.toString() === action.cid.toString());

      if (file) {
        if (!file.download) {
          file.download = {};
        }

        file.download.error = action.error;
      }

      return nextState;
    }

    case Files.FILE_DOWNLOAD_COMPLETE: {
      const nextState = clonedeep(state);

      const file = nextState.inView.find(f => f.cid.toString() === action.cid.toString());

      if (file) {
        if (!file.download) {
          file.download = {};
        }

        file.download.complete = true;
      }

      return nextState;
    }

    case Files.FILE_DOWNLOAD_CLEAR: {
      const nextState = clonedeep(state);

      const file = nextState.inView.find(f => f.cid.toString() === action.cid.toString());

      if (file && file.download) {
        file.download = {};
      }

      return nextState;
    }

    default:
      return state;
  }
}
