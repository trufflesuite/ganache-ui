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

if (process.env.RUN_DEV) { // Executing via "npm run dev"
  const { PORT_ELECTRON_FRONTEND } = require('./env.js')
  config = merge(config, {
    plugins: [
      new webpack.DefinePlugin({
        'process.env.APP_URL': JSON.stringify(`http://localhost:${PORT_ELECTRON_FRONTEND}`)
      }),
      new WebpackShellPlugin({ onBuildEnd: ['electron-forge start'] })
    ]
  })
}

module.exports = [config, chainConfig]
