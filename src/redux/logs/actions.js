const prefix = 'LOGS'

export const ADD_LOG_LINES = `${prefix}/ADD_LOG_LINES`
export const addLogLines = function(lines) {
  if (Array.isArray(lines) == false) {
    lines = [lines]
  }

  return { type: ADD_LOG_LINES, lines }
}