#!/usr/bin/env node
import express from 'express'
import WebSocket from 'ws'
import http from 'http'
import EventEmitter from 'events'
import { createMainActionClient } from './websocket'

import init from './main'

if (process.argv.length < 2) {
  console.error(`usage: node ${path.basename(process.argv[1])} <frontendAssetDir>`)
  process.exit(1)
}
const frontendAssetDir = process.argv[2]

const initialSettings = {
  googleAnalyticsTracking: false,
  cpuAndMemoryProfiling: false,
  verboseLogging: false,
  firstRun: false,
  server: {
    hostname: "127.0.0.1",
    port: 7545,
    network_id: 5777,
    total_accounts: 10,
    unlocked_accounts: [],
    mnemonic: "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat",
    vmErrorsOnRPCResponse: true
  }
}

const app = express()
app.use(express.static(frontendAssetDir))

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

const actionClient = createMainActionClient(wss)

const { setUp, tearDown, handleError } = init(actionClient.send, actionClient)

process.on('uncaughtException', handleError)
process.on('unhandledRejection', handleError)
process.on('exit', tearDown)

setUp()

server.listen(8080, () => console.log('Listening on %d', server.address().port))
