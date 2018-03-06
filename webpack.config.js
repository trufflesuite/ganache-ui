var webpack = require('webpack')
var path = require('path')
var UglifyJsPlugin = require('uglifyjs-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')

const outputDir = path.resolve(__dirname, 'dist')

var config = {
  entry: './src/index.js',
  output: {
    path: outputDir,
    filename: 'bundle.js'
  },
  node: {
    fs: 'empty',
  },
  module: {
    rules: [{
      test: /\.js$/,
      rules: [{
        exclude: /node_modules/,
        loader: 'babel-loader'
      }]
    }, {
      test: /(\.css|\.scss)$/,
      rules: [{
        loader: 'style-loader'
      }, {
        loader: 'css-loader',
        options: {
          sourceMap: true,
          modules: false
        }
      }, {
        loader: 'sass-loader',
        options: {
          sourceMap: true
        }
      }]
    }, {
      test: /\.(png|jpg|gif|ttf)$/,
      use: [{
        loader: 'file-loader',
        options: {
          outputPath: path.resolve(outputDir, 'assets'),
          publicPath: '/assets'
        }
      }]
    }]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/app.webpack.html')
    })
  ]
}

if (process.env.NODE_ENV === 'production') {
  config.devtool = false
  config.plugins.push(
    new UglifyJsPlugin({
      sourceMap: false
    })
  )
} else {
  config.devtool = 'eval-source-map'
  config.devServer = {
    contentBase: outputDir,
    compress: true,
    historyApiFallback: true,
    inline: true
  }
}

module.exports = config
