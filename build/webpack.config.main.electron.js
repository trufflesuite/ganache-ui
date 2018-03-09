const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')
const WebpackShellPlugin = require('webpack-shell-plugin')

const createMainConfig = require('./webpack.config.main.base')
const rendererConfig = require('./webpack.config.renderer.electron')
const chainConfig = require('./webpack.config.main.chain')

let config = createMainConfig('electron-main', 'electron/main', 'main/electron.js')

const appIndexPath = path.relative(config.output.path, path.join(rendererConfig.output.path, 'index.html'))
const chainPath = path.relative(config.output.path, path.join(chainConfig.output.path, chainConfig.output.filename))

config = merge(config, {
  plugins: [
    new webpack.DefinePlugin({
      'process.env.APP_INDEX_PATH': JSON.stringify(appIndexPath),
      'process.env.CHAIN_PATH': JSON.stringify(chainPath)
    })
  ]
})

const outputDir = config.output.path
const outputFile = config.output.filename
if (process.env.NODE_ENV === 'development') {
  config = merge(config, {
    plugins: [
      new WebpackShellPlugin({ onBuildEnd: ['electron-forge start'] })
    ]
  })
}

module.exports = [config, chainConfig]
