const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')
const fs = require('fs')

const createBaseConfig = require('./webpack.config.base')

const sourceDir = path.resolve(__dirname, '../src')

// Source: https://jlongster.com/Backend-Apps-with-Webpack--Part-I
var nodeModules = {}
fs.readdirSync(path.resolve(__dirname, '../node_modules'))
  .filter((x) => ['.bin'].indexOf(x) === -1)
  .forEach((mod) => {
    nodeModules[mod] = 'commonjs ' + mod
  })

module.exports = (target, relOutputDir, relEntryFile) => {
  let config = merge(createBaseConfig(target, relOutputDir), {
    entry: [path.join(sourceDir, relEntryFile)],
    output: {
      filename: 'index.js'
    },
    node: {
      __dirname: false,
      __filename: false
    },
    externals: nodeModules
  })
  if (process.env.NODE_ENV === 'development') {
    config = merge(config, {
      plugins: [
        new webpack.BannerPlugin({ banner: 'require("source-map-support").install();', raw: true, entryOnly: false }),
      ]
    })
  }
  return config
}
