#!/usr/bin/env node
const path = require('path')
const { getConfigPath, run } = require('./common')

if (process.argv.length < 3) {
  const validConfigNames = ['electron', 'web']
  console.error(`Usage: ${path.basename(process.argv[1])} <${validConfigNames.join('|')}>`)
  process.exit(1)
}

const configName = process.argv[2]
const rendererConfigPath = getConfigPath(`renderer.${configName}`)
const mainConfigPath = getConfigPath(`main.${configName}`)
console.log(`Starting dev server using webpack config ${rendererConfigPath}`)
console.log(`Watching main process using webpack config ${mainConfigPath}`)

run('cross-env', 'NODE_ENV=development', 'RUN_DEV=1',
  'concurrently',
  `webpack-dev-server --config "${rendererConfigPath}"`,
  `webpack --watch --config "${mainConfigPath}"`)
