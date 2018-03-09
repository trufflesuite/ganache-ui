#!/usr/bin/env node
const path = require('path')
const { getConfigNames, getConfigPath, run } = require('./common')

const DEFAULT_NODE_ENV = 'production'

if (process.argv.length < 3) {
  const validConfigNames = getConfigNames().filter((name) => !name.endsWith('base'))
  console.error(`Usage: ${path.basename(process.argv[1])} <${validConfigNames.join('|')}>`)
  process.exit(1)
}

let nodeEnv = process.env.NODE_ENV
if (!nodeEnv) {
  console.log(`NODE_ENV is undefined, using ${DEFAULT_NODE_ENV}`)
  nodeEnv = DEFAULT_NODE_ENV
}

const configName = process.argv[2]
const configPath = getConfigPath(configName)
console.log(`Compiling using webpack config ${configPath}`)

run(`cross-env NODE_ENV=${nodeEnv} webpack --config ${configPath}`)
