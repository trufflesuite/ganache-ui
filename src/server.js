
import express from 'express'
import WebSocket from 'ws'
import http from 'http'

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

app.use(express.static('../dist'))

const server = http.createServer(app)

const wss = new WebSocket.Server({ server })

wss.on('connection', (ws, req) => {
  ws.on('message', (message) => {
    //
    // Here we can now use session parameters.
    //
    console.log(`WS message ${message}`)
  })
})

//
// Start the server.
//
server.listen(8080, () => console.log('Listening on %d', server.address().port))
