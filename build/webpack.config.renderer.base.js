const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')
const fs = require('fs')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const createBaseConfig = require('./webpack.config.base')

const sourceDir = path.resolve(__dirname, '../src')

module.exports = (target, relOutputDir) => {
  const config = merge(createBaseConfig(target, relOutputDir), {
    entry: path.join(sourceDir, 'app.js'),
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
    config.plugins.push(new UglifyJsPlugin({
      sourceMap: false
    }))
  }
  return config
}
