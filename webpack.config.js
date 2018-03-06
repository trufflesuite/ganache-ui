const webpack = require('webpack')
const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const outputDir = path.resolve(__dirname, 'dist')
const publicDir = path.resolve(outputDir, 'public')

const nodeEnvPlugin = new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
})

const jsRule = {
  test: /\.js$/,
  rules: [{
    exclude: /node_modules/,
    loader: 'babel-loader'
  }]
}

const cssRule = {
  test: /(\.css|\.scss)$/,
  rules: [
    { loader: 'style-loader'},
    { loader: 'css-loader',
      options: {
        sourceMap: true,
        modules: false
      }
    },
    { loader: 'sass-loader',
      options: {
        sourceMap: true
      }
    }
  ]
}

const fileRule = {
  test: /\.(png|jpg|gif|ttf)$/,
  use: [{
    loader: 'file-loader',
    options: {
      outputPath: 'assets',
      publicPath: '/assets'
    }
  }]
}

const serverConfig = {
  target: 'node',
  entry: './src/server.js',
  output: {
    path: outputDir,
    filename: 'server.js'
  },
  plugins: [
    nodeEnvPlugin
  ],
  module: {
    rules: [jsRule]
  },
  externals: {
    ws: 'ws',
    express: 'express'
  }
}

const webConfig = {
  target: 'web',
  entry: './src/index.js',
  output: {
    path: outputDir,
    filename: 'bundle.js'
  },
  node: {
    fs: 'empty',
  },
  module: {
    rules: [jsRule, cssRule, fileRule]
  },
  plugins: [
    nodeEnvPlugin,
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/app.webpack.html')
    })
  ]
}

if (process.env.NODE_ENV === 'production') {
  webConfig.devtool = false
  webConfig.plugins.push(
    new UglifyJsPlugin({
      sourceMap: false
    }),
    new CleanWebpackPlugin(publicDir)
  )
} else {
  webConfig.devtool = 'eval-source-map'
  webConfig.devServer = {
    contentBase: publicDir,
    compress: true,
    historyApiFallback: true,
    inline: true
  }
}

module.exports = [webConfig, serverConfig]
