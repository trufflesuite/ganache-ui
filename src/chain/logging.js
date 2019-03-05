var path = require("path");
var fse = require("fs-extra");
var padStart = require("lodash.padstart");

var logFile;

function getFileTimestamp() {
  const currentDate = new Date();
  const currentDateString = [
    currentDate.getFullYear(),
    padStart(currentDate.getMonth() + 1, 2, "0"),
    padStart(currentDate.getDate(), 2, "0"),
    "-",
    padStart(currentDate.getHours(), 2, "0"),
    padStart(currentDate.getMinutes(), 2, "0"),
    padStart(currentDate.getSeconds(), 2, "0"),
  ].join("");

  return currentDateString;
}

function getLogTimestamp() {
  const currentDate = new Date();
  const currentDateString = [
    currentDate.getFullYear(),
    "/",
    padStart(currentDate.getMonth() + 1, 2, "0"),
    "/",
    padStart(currentDate.getDate(), 2, "0"),
    " ",
    padStart(currentDate.getHours(), 2, "0"),
    ":",
    padStart(currentDate.getMinutes(), 2, "0"),
    ":",
    padStart(currentDate.getSeconds(), 2, "0"),
    ".",
    padStart(currentDate.getMilliseconds(), 3, "0"),
  ].join("");

  return currentDateString;
}

module.exports.generateLogFilePath = function(directory) {
  if (!fse.existsSync(directory)) {
    console.log(
      "The Log Directory '" +
        directory +
        "' doesn't exist; attempting to create it now",
    );
    fse.mkdirpSync(directory);
  }

  logFile = path.join(directory, "ganache-" + getFileTimestamp() + ".log");
};

module.exports.logToFile = function(message) {
  if (logFile) {
    const directory = path.dirname(logFile);
    if (!fse.existsSync(directory)) {
      console.log(
        "The Log Directory '" +
          directory +
          "' doesn't exist; attempting to create it now",
      );
      fse.mkdirpSync(directory);
    }

    message = "[" + getLogTimestamp() + "] - " + message + "\n";

    try {
      fse.appendFileSync(logFile, message);
    } catch (e) {
      console.error("Error: Could not write to file. Details: " + e);
    }
  }
};
