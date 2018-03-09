const webpack = require('webpack')
const merge = require('webpack-merge')

const { PORT_ELECTRON_FRONTEND } = require('./env.js')

const createRendererConfig = require('./webpack.config.renderer.base')

let config = createRendererConfig('electron-renderer', 'electron/renderer')

if (process.env.NODE_ENV === 'development') {
  config = merge(config, {
    devServer: {
      port: PORT_ELECTRON_FRONTEND
    }
  })
}

module.exports = config
