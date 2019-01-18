import * as Logs from "./actions";

const initialState = {
  lines: [],
};

export default function(state = initialState, action) {
  switch (action.type) {
    case Logs.ADD_LOG_LINES:
      var time = new Date();
      var newLines = action.lines.map(line => {
        return { time: time, line: line };
      });

      return Object.assign({}, state, {
        lines: state.lines.concat(newLines),
      });

    case Logs.CLEAR_LOG_LINES:
      return Object.assign({}, state, {
        lines: [],
      });

    default:
      return state;
  }
}
