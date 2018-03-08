#!/usr/bin/env node
import express from 'express'
import http from 'http'
import { createServerActionClient } from '../websocket'

import init from './init'

const app = express()
app.use(express.static(path.dirname(path.resolve(__dirname, process.env.APP_INDEX_PATH))))

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

const serverActionClient = createServerActionClient(wss)

const { setUp, tearDown, handleError } = init(serverActionClient)

process.on('uncaughtException', handleError)
process.on('unhandledRejection', handleError)
process.on('exit', tearDown)

setUp()

server.listen(8080, () => console.log('Listening on %d', server.address().port))
