const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')
const WebpackShellPlugin = require('webpack-shell-plugin')

const createMainConfig = require('./webpack.config.main.base')
const rendererConfig = require('./webpack.config.renderer.web')
const chainConfig = require('./webpack.config.main.chain')

const baseConfig = createMainConfig('node', 'web/main', 'main/web.js')

const appIndexPath = path.relative(baseConfig.output.path, path.join(rendererConfig.output.path, 'index.html'))
const chainPath = path.relative(baseConfig.output.path, path.join(chainConfig.output.path, chainConfig.output.filename))

const config = merge(baseConfig, {
  plugins: [
    new webpack.ProvidePlugin({
      WebSocket: 'ws'
    }),
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
    new WebpackShellPlugin({ onBuildEnd: [`nodemon -w ${outputDir} ${path.join(outputDir, outputFile)}`] })
  )
}

module.exports = config
