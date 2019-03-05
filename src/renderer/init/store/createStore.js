if (process.env.NODE_ENV === "production") {
  module.exports = require("./createStore.production"); // eslint-disable-line global-require
} else {
  module.exports = require("./createStore.development"); // eslint-disable-line global-require
}
