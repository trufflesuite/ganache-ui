#!/usr/bin/env node
const { run, getConfigPath, getArg } = require('./common')

const configName = getArg(['electron', 'web'])
const rendererConfigPath = getConfigPath(`renderer.${configName}`)
const mainConfigPath = getConfigPath(`main.${configName}`)
console.log(`Starting dev server using webpack config ${rendererConfigPath}`)
console.log(`Watching main process using webpack config ${mainConfigPath}`)

run('cross-env', 'NODE_ENV=development', 'RUN_DEV=1',
  'concurrently',
  `webpack-dev-server --config "${rendererConfigPath}"`,
  `webpack --watch --config "${mainConfigPath}"`)
