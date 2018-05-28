const webpack = require('webpack')
const merge = require('webpack-merge')

const createRendererConfig = require('./webpack.config.renderer.base')

let config = createRendererConfig('electron-renderer', 'electron/renderer')

if (process.env.RUN_DEV) {
  const { PORT_ELECTRON_FRONTEND } = require('./env.js')
  config = merge(config, {
    devServer: {
      port: PORT_ELECTRON_FRONTEND
    }
  })
}

module.exports = config
