const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const createBaseConfig = require('./webpack.config.base')

module.exports = (target, relOutputDir, excludeFromClean) => {
  const baseConfig = createBaseConfig(target, relOutputDir, excludeFromClean)
  let config = merge(baseConfig, {
    entry: [path.join(baseConfig.context, 'src/app.js')],
    output: {
      filename: 'ganache.[hash:8].js'
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.join(baseConfig.context, 'src/app.html')
      })
    ],
    node: {
      fs: 'empty'
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
