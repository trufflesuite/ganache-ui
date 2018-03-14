const path = require('path')
const { spawnSync } = require('child_process')
const fs = require('fs')

const DEFAULT_NODE_ENV = 'production'

const webpackDir = path.resolve(__dirname, '../')

const getConfigPath = (configName) => path.resolve(webpackDir, `webpack.config.${configName}.js`)

const getConfigNames = () => fs.readdirSync(webpackDir)
  .filter((f) => f.startsWith('webpack.config'))
  .map((f) => f.replace('webpack.config.', '').replace('.js', ''))
  .filter((name) => !name.endsWith('base'))

const run = (cmd, ...args) => spawnSync(cmd, args, { stdio: 'inherit' })

const getArg = (enumValues) => {
  const arg = process.argv[2]
  if (process.argv.length <= 2 || !enumValues.includes(arg)) {
    console.error(`Usage: ${path.basename(process.argv[1])} <${enumValues.join('|')}>`)
    process.exit(1)
  }
  return arg
}

const getNodeEnv = () => {
  if (!process.env.NODE_ENV) {
    console.log(`NODE_ENV is undefined, using ${DEFAULT_NODE_ENV}`)
    return DEFAULT_NODE_ENV
  }
  return process.env.NODE_ENV
}

module.exports = {
  webpackDir,
  getConfigPath,
  getConfigNames,
  run,
  getArg,
  getNodeEnv
}
