const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')
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

module.exports = config
