if (process.env.NODE_ENV === "production") {
  module.exports = require("./createStore.production");
} else {
  module.exports = require("./createStore.development");
}
