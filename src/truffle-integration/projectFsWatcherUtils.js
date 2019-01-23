const path = require("path");

/**
 *
 * @param {*} truffle_directory The directory of your Truffle project
 * @param {*} currDir The current directory
 * @param {*} ancestorDirs The current array of ancestor dirs found
 * @returns {string[]} An array of directory names which are ancestors to currDir
 */
const getAncestorDirs = (truffle_directory, currDir, ancestorDirs = []) => {
  const parent = path.dirname(currDir);

  if (parent === currDir) return ancestorDirs;
  else if (parent === truffle_directory) return [parent, ...ancestorDirs];
  return getAncestorDirs(truffle_directory, parent, [parent, ...ancestorDirs]);
};

module.exports = {
  getAncestorDirs,
};
