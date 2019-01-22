const fs = require("fs");
const path = require("path");

function afterPrune(buildPath, electronVersion, platform, arch, callback) {
  if (platform === "darwin" || platform === "mas") {
    let toRemove = path.join(buildPath, "node_modules/fsevents/build");
    deleteFolderRecursive(toRemove);
  }

  if (callback && typeof callback === "function") {
    return callback();
  }
}

var deleteFolderRecursive = function(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach(function(file) {
      var curdirPath = path.join(dirPath, file);
      if (fs.lstatSync(curdirPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curdirPath);
      } else {
        // delete file
        fs.unlinkSync(curdirPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
};

module.exports = afterPrune;
