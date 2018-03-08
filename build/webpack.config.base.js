const webpack = require('webpack')
const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const env = process.env.NODE_ENV

const projectRoot = path.resolve(__dirname, '../')
const baseOutputDir = path.join(projectRoot, 'dist')

const envPlugin = (target) => new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify(env),
  'process.env.WEBPACK_TARGET': JSON.stringify(target),
  'process.env.ELECTRON': JSON.stringify(target.includes('electron'))
});

const jsRule = {
  test: /\.js$/,
  rules: [{
    exclude: /node_modules/,
    use: ['babel-loader', 'shebang-loader']
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
  test: /\.(png|jpg|gif|ttf|ico)$/,
  use: [{
    loader: 'file-loader',
    options: {
      outputPath: 'assets/',
      publicPath: 'assets/',
      name (file) {
        if (env === 'development') {
          return '[path][name].[ext]'
        }

        return '[hash].[ext]'
      }
    }
  }]
}

module.exports = (target, relOutputDir) => {
  const outputDir = path.join(baseOutputDir, relOutputDir)
  return {
    target: target,
    context: projectRoot,
    output: {
      path: outputDir
    },
    module: {
      rules: [jsRule, cssRule, fileRule]
    },
    plugins: [
      envPlugin(target),
      new CleanWebpackPlugin(outputDir),
    ],
    devtool: env === 'development' && 'eval-source-map'
  }
}
