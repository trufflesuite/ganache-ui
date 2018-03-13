const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')

const pkg = require('../package.json')
const createRendererConfig = require('./webpack.config.renderer.base')

const { PORT_WEB_FRONTEND, PORT_WEB_BACKEND } = require('./env.js')

const env = process.env.NODE_ENV

let config = createRendererConfig('web', 'web/renderer')

config = merge(config, {
  plugins: [
    new FaviconsWebpackPlugin({
      logo: path.join(config.context, 'resources/logo.png'),
      prefix: 'assets/favicon-[hash:8]/',
      emitStats: env === 'development',
      statsFilename: 'faviconstats.[hash:8].json',
      cache: true,
      inject: true,
      background: '#fff',
      title: pkg.productName
    })
  ]
})

if (env === 'development') {
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
