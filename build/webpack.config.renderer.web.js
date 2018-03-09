const webpack = require('webpack')
const merge = require('webpack-merge')

const createRendererConfig = require('./webpack.config.renderer.base')

const BACKEND_PORT = process.env.BACKEND_PORT || 8181

let config = createRendererConfig('web', 'web/renderer')

if (process.env.NODE_ENV === 'development') {
  config = merge(config, {
    devServer: {
      proxy: {
        '/wss': {
          target: `http://localhost:${BACKEND_PORT}`,
          ws: true,
          changeOrigin: true
        }
      }
    }
  })
}

module.exports = config
