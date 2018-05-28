/** The following ports are only used during development to allow for webpack hot reloading
  * In production:
  * - electron handles serving files directly
  * - web frontend and backend both use port defined in src/main/web.js
  */
const WEBPACK_PORT = Number.parseInt(process.env.WEBPACK_PORT || 0)
const BACKEND_PORT = Number.parseInt(process.env.BACKEND_PORT || 0)
const PORT_ELECTRON_FRONTEND = WEBPACK_PORT || 8081
const PORT_WEB_FRONTEND = WEBPACK_PORT || 8082
const PORT_WEB_BACKEND = BACKEND_PORT || (PORT_WEB_FRONTEND + 10)

module.exports = { PORT_ELECTRON_FRONTEND, PORT_WEB_FRONTEND, PORT_WEB_BACKEND }
