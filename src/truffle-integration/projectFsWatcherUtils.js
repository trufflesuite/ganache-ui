const path = require("path");

const getAncestorDirs = (truffle_directory, currDir, dirs = []) => {
  const parent = path.dirname(currDir);

  if (parent === currDir) return dirs;
  else if (parent === truffle_directory) return [parent, ...dirs];
  return getAncestorDirs(truffle_directory, parent, [parent, ...dirs]);
};

module.exports = {
  getAncestorDirs,
};
