#!/usr/bin/env node
import express from 'express'
import http from 'http'
import path from 'path'

import init from './init'

import { createServerActionClient } from '../wsActionClient'

const PORT = process.env.PORT || 8080

const app = express()
app.use(express.static(path.dirname(path.resolve(__dirname, process.env.APP_INDEX_PATH))))

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

const serverActionClient = createServerActionClient(wss)

const { setUp, tearDown, handleError } = init(serverActionClient.send, serverActionClient)

process.on('uncaughtException', handleError)
process.on('unhandledRejection', handleError)
process.on('exit', tearDown)

setUp()

server.listen(PORT, () => console.log('Backend server listening on %d', server.address().port))
