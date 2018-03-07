const webpack = require('webpack')
const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const outputDir = path.resolve(__dirname, 'dist')
const publicDir = path.resolve(outputDir, 'public')

const envPlugin = (target) => new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  'process.env.TARGET': JSON.stringify(target)
});

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
  entry: './src/main-browser.js',
  output: {
    path: outputDir,
    filename: 'server.js'
  },
  module: {
    rules: [jsRule]
  },
  plugins: [
    envPlugin('node')
  ],
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
  module: {
    rules: [jsRule, cssRule, fileRule]
  },
  plugins: [
    envPlugin('web'),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/app.webpack.html')
    })
  ],
  node: {
    fs: 'empty',
  }
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
