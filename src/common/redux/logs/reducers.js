import * as Logs from "./actions";

const initialState = {
  "default": {
    lines: []
  }
};

export default function(state = initialState, action) {
  switch (action.type) {
    case Logs.ADD_LOG_LINES:
      var time = new Date();
      var newLines = action.lines.map(line => {
        return { time: time, line: line };
      });

      var context = action.context || "default";
      var group = state[context];
      var oldLines = group ? [...group.lines] : [];
      if (oldLines.length > 0 && newLines.length > 0) {
        const firstLine = newLines.shift();
        oldLines[oldLines.length - 1].line += firstLine.line;
      }
      return Object.assign({}, state, {
        [context]: {
          lines: oldLines.concat(newLines)
        }
      });

    case Logs.CLEAR_LOG_LINES:
      return Object.assign({}, state, {
        [action.context]: {
          lines: []
        }
      });

    default:
      return state;
  }
}
