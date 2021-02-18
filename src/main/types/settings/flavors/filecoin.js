const FilecoinProvider = require("@ganache/filecoin").Provider;

module.exports = {
  name: "Quickstart",
  isDefault: true,
  verboseLogging: false,
  randomizeMnemonicOnStart: false,
  logsDirectory: null,
  server: {
    hostname: "127.0.0.1",
    port: 7545,
    schema: FilecoinProvider.Schema
  }
}
