#!/usr/bin/env node
import express from 'express'
import http from 'http'
import { createServerActionClient } from './websocket'

import init from './main'

if (process.argv.length < 2) {
  console.error(`usage: node ${path.basename(process.argv[1])} <frontendAssetDir>`)
  process.exit(1)
}
const frontendAssetDir = process.argv[2]

const app = express()
app.use(express.static(frontendAssetDir))

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

const serverActionClient = createServerActionClient(wss)

const { setUp, tearDown, handleError } = init(serverActionClient)

process.on('uncaughtException', handleError)
process.on('unhandledRejection', handleError)
process.on('exit', tearDown)

setUp()

server.listen(8080, () => console.log('Listening on %d', server.address().port))
