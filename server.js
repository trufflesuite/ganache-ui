/* eslint-disable no-console */
/**
 * Setup and run the development server for Hot-Module-Replacement
 * https://webpack.github.io/docs/hot-module-replacement-with-webpack.html
 */

import path from 'path'
import express from 'express'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import { spawn } from 'child_process'

import config from './webpack.config.development'

const argv = require('minimist')(process.argv.slice(2))

const app = express()
const compiler = webpack(config)
const PORT = process.env.PORT || 3000

const wdm = webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
  noInfo: true,
  stats: 'errors-only'
})

app.use(wdm)

app.use(webpackHotMiddleware(compiler))

app.get(/\.dll\.js$/, (req, res) => {
  const filename = req.path.replace(/^\//, '')
  res.sendFile(path.join(process.cwd(), './app', filename))
})

const server = app.listen(PORT, 'localhost', serverError => {
  if (serverError) {
    return console.error(serverError)
  }

  if (argv['start-hot']) {
    spawn('npm', ['run', 'start-hot'], {
      shell: true,
      env: process.env,
      stdio: 'inherit'
    })
      .on('close', code => process.exit(code))
      .on('error', spawnError => console.error(spawnError))
  }

  console.log(
    `👩🏾‍💻  Webpack Dev Server Listening at http://localhost:${PORT}`
  )
})

process.on('SIGTERM', () => {
  console.log('Stopping dev server')
  wdm.close()
  server.close(() => {
    process.exit(0)
  })
})
