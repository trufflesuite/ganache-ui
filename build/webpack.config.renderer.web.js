const webpack = require('webpack')
const merge = require('webpack-merge')

const createRendererConfig = require('./webpack.config.renderer.base')

const { PORT_WEB_FRONTEND, PORT_WEB_BACKEND } = require('./env.js')

let config = createRendererConfig('web', 'web/renderer')

if (process.env.NODE_ENV === 'development') {
  config = merge(config, {
    devServer: {
      port: PORT_WEB_FRONTEND,
      proxy: {
        '/wss': {
          target: `http://localhost:${PORT_WEB_BACKEND}`,
          ws: true,
          changeOrigin: true
        }
      }
    }
  })
}

module.exports = config
