const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')
const fs = require('fs')

const createBaseConfig = require('./webpack.config.base')

const sourceDir = path.resolve(__dirname, '../src')

// Source: https://jlongster.com/Backend-Apps-with-Webpack--Part-I
var nodeModules = {}
fs.readdirSync(path.resolve(__dirname, '../node_modules'))
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod
  });

module.exports = (target, relOutputDir, relEntryFile) => {
  const config = merge(createBaseConfig(target, relOutputDir), {
    target: target,
    entry: path.join(sourceDir, relEntryFile),
    output: {
      filename: 'index.js'
    },
    node: {
      __dirname: false,
      __filename: false,
      process: false
    },
    externals: nodeModules
  })
  if (process.env.NODE_ENV === 'development') {
    config.plugins.push(
      new webpack.BannerPlugin({ banner: 'require("source-map-support").install();', raw: true, entryOnly: false }),
    )
  }
  return config
}
