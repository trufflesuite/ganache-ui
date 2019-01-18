// Assuming this file is ./src/es6-init.js
var path = require("path");
var appRoot = path.join(__dirname, "..");

require("electron-compile").init(appRoot, require.resolve("./main/main"));
