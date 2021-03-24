const WindowsConfig = require("./electron-builder.windows.config");
const MacConfig = require("./electron-builder.mac.config");
const LinuxConfig = require("./electron-builder.linux.config");

// const config = {
//   npmRebuild: false,
//   appId: "org.trufflesuite.ganache",
//   afterSign: "./scripts/build/afterSignHook.js",
//   afterPack: "./scripts/build/afterPack.js",
//   asarUnpack: "**/*",
//   files: [
//     "src/**/*",
//     "node_modules/**/*",
//     "package.json"
//   ],
//   ...WindowsConfig,
//   ...MacConfig,
//   ...LinuxConfig
// };

// module.exports = config;

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  npmRebuild: false,
  appId: "org.trufflesuite.ganache",
  afterSign: "./scripts/build/afterSignHook.js",
  afterPack: "./scripts/build/afterPack.js",
  asarUnpack: "**/*",
  directories: {
    output: "dist",
    buildResources: "static"
  },
  files: [
    "src/**/dist/*",
    "node_modules/**/*",
    "package.json",
    "static/**/*"
  ],
  ...WindowsConfig,
  ...MacConfig,
  ...LinuxConfig
}

module.exports = config

