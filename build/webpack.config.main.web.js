const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')
const WebpackShellPlugin = require('webpack-shell-plugin')

const createMainConfig = require('./webpack.config.main.base')
const rendererConfig = require('./webpack.config.renderer.web')
const chainConfig = require('./webpack.config.main.chain')

let config = createMainConfig('node', 'web/main', 'main/web.js')

const appIndexPath = path.relative(config.output.path, path.join(rendererConfig.output.path, 'index.html'))
const chainPath = path.relative(config.output.path, path.join(chainConfig.output.path, chainConfig.output.filename))

config = merge(config, {
  plugins: [
    new webpack.DefinePlugin({
      'process.env.APP_INDEX_PATH': JSON.stringify(appIndexPath),
      'process.env.CHAIN_PATH': JSON.stringify(chainPath)
    }),
    new webpack.ProvidePlugin({
      WebSocket: 'ws'
    })
  ]
})

if (process.env.RUN_DEV) { // Executing via "npm run dev"
  const { PORT_WEB_BACKEND } = require('./env.js')
  const outputDir = config.output.path
  const outputFile = config.output.filename

  config = merge(config, {
    plugins: [
      new webpack.DefinePlugin({
        'process.env.PORT': PORT_WEB_BACKEND
      }),
      new WebpackShellPlugin({ onBuildEnd: [`nodemon -w ${outputDir} -w ${chainConfig.output.path} ${path.join(outputDir, outputFile)}`] })
    ]
  })
}

module.exports = [config, chainConfig]
