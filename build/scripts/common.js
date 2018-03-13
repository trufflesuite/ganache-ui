const path = require('path')
const { spawnSync } = require('child_process')
const fs = require('fs')

const webpackDir = path.resolve(__dirname, '../')

const getConfigPath = (configName) => path.resolve(webpackDir, `webpack.config.${configName}.js`)

const getConfigNames = () => fs.readdirSync(webpackDir)
  .filter((f) => f.startsWith('webpack.config'))
  .map((f) => f.replace('webpack.config.', '').replace('.js', ''))

const run = (cmd, ...args) => spawnSync(cmd, args, { stdio: 'inherit' })

module.exports = {
  webpackDir,
  getConfigPath,
  getConfigNames,
  run,
}
