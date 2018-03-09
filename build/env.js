/** The following ports are only used during development to allow for webpack hot reloading
  * In production:
  * - electron handles serving files directly
  * - web frontend and backend both use port defined in src/main/web.js
  */
const PORT_ELECTRON_FRONTEND = process.env.WEBPACK_PORT || 8081
const PORT_WEB_FRONTEND = process.env.WEBPACK_PORT || 8082
const PORT_WEB_BACKEND = process.env.BACKEND_PORT || (PORT_WEB_FRONTEND + 10)

module.exports = { PORT_ELECTRON_FRONTEND, PORT_WEB_FRONTEND, PORT_WEB_BACKEND }
