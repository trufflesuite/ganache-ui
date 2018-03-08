
// return a sanitized error string from an Error object or string which contains an error message
export function sanitizeError(errorUnsanitized) {
  return sanitizePaths(errorUnsanitized.stack || errorUnsanitized)
}

// Remove any user-specific paths in exception messages
export function sanitizePaths (message) {
  if (process.env.PLATFORM !== 'browser') {
    const { remote } = require('electron')
    // Prepare our paths so we *always* will get a match no matter
    // path separator (oddly, on Windows, different errors will give
    // us different path separators)
    var appPath = remote.app.getAppPath().replace(/\\/g, "/")

    // I couldn't figure out the regex, so a loop will do.
    while (message.indexOf(appPath) >= 0) {
      message = message.replace(appPath, "")
    }
  }
  return message
}

