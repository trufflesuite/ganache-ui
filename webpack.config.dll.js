import path from 'path'
import webpack from 'webpack'

const outputPath = path.resolve('./app')

import { dependencies } from './package.json'

module.exports = {
  context: process.cwd(),

  devtool: 'eval',

  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },

  entry: {
    vendor: Object.keys(dependencies || {}).filter(
      dependency =>
        dependency !== 'font-awesome' &&
        dependency !== 'universal-analytics' &&
        dependency !== 'find-process' &&
        dependency !== 'pidusage' &&
        dependency !== '@exponent/electron-cookies'
    )
  },

  resolve: {
    modules: ['app']
  },

  output: {
    filename: '[name].dll.js',
    path: outputPath,
    library: '[name]',
    libraryTarget: 'var'
  },

  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),

    new webpack.DllPlugin({
      name: '[name]',
      context: process.cwd(),
      path: path.join(outputPath, '[name].dll.json')
    })
  ]
}
