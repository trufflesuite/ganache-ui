const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')
const WebpackShellPlugin = require('webpack-shell-plugin')

const createMainConfig = require('./webpack.config.main.base')
const rendererConfig = require('./webpack.config.renderer.electron')
const chainConfig = require('./webpack.config.main.chain')

const baseConfig = createMainConfig('electron-main', 'electron/main', 'main/electron.js')

const appIndexPath = path.relative(baseConfig.output.path, path.join(rendererConfig.output.path, 'index.html'))
const chainPath = path.relative(baseConfig.output.path, path.join(chainConfig.output.path, chainConfig.output.filename))

const config = merge(baseConfig, {
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
  config.plugins.push(
    new WebpackShellPlugin({ onBuildEnd: ['electron-forge start'] })
  )
}

module.exports = config
