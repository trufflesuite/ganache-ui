var path = require("path")
var fs = require("fs")
var padStart = require("lodash.padstart")

var logFile;

function getFileTimestamp() {
  const currentDate = new Date()
  const currentDateString = [
    currentDate.getFullYear(),
    padStart(currentDate.getMonth() + 1, 2, "0"),
    padStart(currentDate.getDate(), 2, "0"),
    "-",
    padStart(currentDate.getHours(), 2, "0"),
    padStart(currentDate.getMinutes(), 2, "0"),
    padStart(currentDate.getSeconds(), 2, "0")
  ].join("")

  return currentDateString
}

function getLogTimestamp() {
  const currentDate = new Date()
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
    padStart(currentDate.getMilliseconds(), 3, "0")
  ].join("")

  return currentDateString
}

function mkDirByPathSync(targetDir, {isRelativeToScript = false} = {}) {
  const sep = path.sep;
  const initDir = path.isAbsolute(targetDir) ? sep : '';
  const baseDir = isRelativeToScript ? __dirname : '.';

  targetDir.split(sep).reduce((parentDir, childDir) => {
    const curDir = path.resolve(baseDir, parentDir, childDir);
    try {
      fs.mkdirSync(curDir);
      console.log(`Directory ${curDir} created!`);
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }

      console.log(`Directory ${curDir} already exists!`);
    }

    return curDir;
  }, initDir);
}

module.exports.generateLogFilePath = function(directory) {
  if (!fs.existsSync(directory)) {
    console.log("The Log Directory '" + directory + "' doesn't exist; attempting to create it now")
    fs.mkdirSync(directory)
  }

  logFile = path.join(options.logDirectory, "ganache-" + getFileTimestamp() + ".log")
}

module.exports.logToFile = function(message) {
  if (logFile) {
    message = "[" + getLogTimestamp() + "] - " + message + "\n"

    try {
      fs.appendFileSync(logFile, message)
    }
    catch()
  }
}