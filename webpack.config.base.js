/**
 * Base webpack config used across other specific configs
 */

import path from 'path'
import validate from 'webpack-validator'

import {
  dependencies as externals
} from './app/package.json'

export default validate({
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['babel-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.svg$/,
        loader: 'babel?presets[]=es2015,presets[]=react!svg-react'
      }
    ]
  },

  output: {
    path: path.resolve('./app'),
    filename: 'bundle.js',

    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2'
  },

  // https://webpack.github.io/docs/configuration.html#resolve
  resolve: {
    root: path.resolve('./app'),
    extensions: ['', '.js', '.jsx', '.json'],
    packageMains: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main'],
    modulesDirectories: [ path.resolve('./app'), 'node_modules' ],
    alias: {
      CoreStyles: path.resolve('./app/Styles')
    }
  },

  plugins: [],

  externals: Object.keys(externals || {})
})
