#!/usr/bin/env node
const { run, getConfigNames, getConfigPath, getArg, getNodeEnv } = require('./common')

const configName = getArg(getConfigNames())
const configPath = getConfigPath(configName)
const nodeEnv = getNodeEnv()
console.log(`Compiling using webpack config ${configPath}`)

run('cross-env', `NODE_ENV=${nodeEnv}`, 'webpack', '--config', configPath, ...process.argv.slice(3))
