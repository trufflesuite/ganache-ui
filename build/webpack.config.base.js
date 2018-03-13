const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const env = process.env.NODE_ENV
const isDev = env === 'development'

const projectRoot = path.resolve(__dirname, '../')
const baseOutputDir = path.join(projectRoot, 'dist')

const envPlugin = (target) => new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify(env),
  'process.env.WEBPACK_TARGET': JSON.stringify(target),
  'process.env.ELECTRON': JSON.stringify(target.includes('electron'))
})

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
    { loader: 'style-loader' },
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

const createFileRule = (test, subDir) => ({
  test,
  use: [{
    loader: 'file-loader',
    options: {
      context: path.join(projectRoot, 'resources'),
      outputPath: 'assets/',
      name: () => isDev ? '[path][name].[ext]' : `${subDir}/[hash].[ext]`
    }
  }]
})

const imgRule = createFileRule(/\.(png|jpe?g|gif|svg|ico)(\?.*)?$/, 'img')
const fontRule = createFileRule(/\.(woff2?|eot|ttf|otf)(\?.*)?$/, 'font')

// Explicitly specify what to clean to avoid wiping favicons cache
const filesToClean = ['*.*', 'assets/img/', 'assets/font/']

module.exports = (target, relOutputDir) => {
  const outputDir = path.join(baseOutputDir, relOutputDir)
  let config = {
    target: target,
    context: projectRoot,
    output: {
      path: outputDir
    },
    module: {
      rules: [jsRule, cssRule, imgRule, fontRule]
    },
    plugins: [
      envPlugin(target),
      new CleanWebpackPlugin(filesToClean.map((f) => path.join(outputDir, f)), { root: baseOutputDir })
    ],
    devtool: env === 'development' && 'eval-source-map'
  }
  return config
}
