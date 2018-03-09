const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')
const fs = require('fs')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const createBaseConfig = require('./webpack.config.base')

const sourceDir = path.resolve(__dirname, '../src')

module.exports = (target, relOutputDir) => {
  const baseConfig = createBaseConfig(target, relOutputDir)
  let config = merge(baseConfig, {
    entry: [path.join(sourceDir, 'app.js')],
    output: {
      filename: 'bundle.[hash:6].js'
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.join(sourceDir, 'app.html')
      })
    ],
    node: {
      fs: 'empty',
    },
    resolve: {
      mainFields: ['browser', 'module', 'main']
    }
  })
  if (process.env.NODE_ENV === 'production') {
    config = merge(config, {
      plugins: [
        new UglifyJsPlugin({ sourceMap: false })
      ]
    })
  } else {
    config = merge(config, {
      devServer: {
        contentBase: baseConfig.output.path,
        hot: true
      },
      plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin()
      ]
    })
  }
  return config
}
