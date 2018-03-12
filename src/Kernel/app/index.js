/** Handles all platform dependent app functions for web and electron-renderer targets */

if (process.env.WEBPACK_TARGET === 'web') {
  module.exports = require('./web')
} else if (process.env.WEBPACK_TARGET === 'electron-renderer') {
  module.exports = require('./electron')
} else {
  throw new Error(`Invalid WEBPACK_TARGET=${process.env.WEBPACK_TARGET} - only web and electron-renderer targets should use this module`)
}
