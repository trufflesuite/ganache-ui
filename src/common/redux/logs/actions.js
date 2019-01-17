const prefix = "LOGS";

export const ADD_LOG_LINES = `${prefix}/ADD_LOG_LINES`;
export const CLEAR_LOG_LINES = `${prefix}/CLEAR_LOG_LINES`;

export const addLogLines = function(lines) {
  if (Array.isArray(lines) == false) {
    lines = [lines];
  }

  return { type: ADD_LOG_LINES, lines };
};

export const clearLogLines = function() {
  return { type: CLEAR_LOG_LINES };
};
