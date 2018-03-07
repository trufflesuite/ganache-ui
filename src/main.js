import path from 'path'

import {
  REQUEST_SERVER_RESTART,
  SET_SERVER_STARTED,
  SET_SERVER_STOPPED,
  SET_KEY_DATA,
  SET_SYSTEM_ERROR
} from './Actions/Core'
import { REQUEST_SAVE_SETTINGS } from './Actions/Settings'
import { ADD_LOG_LINES } from './Actions/Logs'

import ChainService from './Services/Chain'
import SettingsService from './Services/Settings'

function init(sendAction, actionEmitter) {
  const chain = new ChainService()
  const Settings = new SettingsService()

  Settings.bootstrap();

  function setUp() {
    chain.on("start", () => {
      chain.startServer(Settings.getAll().server)
    })

    chain.on("server-started", (data) => {
      sendAction(SET_KEY_DATA, {
        privateKeys: data.privateKeys,
        mnemonic: data.mnemonic,
        hdPath: data.hdPath
      })

      Settings.handleNewMnemonic(data.mnemonic)

      sendAction(SET_SERVER_STARTED, Settings.getAll())
    })

    const chainLogger = (level, data) => {
      const lines = data.split(/\n/g)
      sendAction(ADD_LOG_LINES, lines)
      if (process.env.TARGET === 'node') {
        lines.map((line) => console[level]('ChainService:', line))
      }
    }

    chain.on("stdout", (data) => chainLogger('log', data))

    chain.on("stderr", (data) => chainLogger('error', data))

    chain.on("error", (error) => {
      console.log(error)
      sendAction(SET_SYSTEM_ERROR, error)
    })

    chain.start()
  }

  function tearDown() {
    chain.stopProcess();
  }

  function handleError(err) {
    if (err) {
      sendAction(SET_SYSTEM_ERROR, err.stack || err)
    }
  }

  // If the frontend asks to start the server, start the server.
  // This will trigger then chain event handlers above once the server stops.
  actionEmitter.on(REQUEST_SERVER_RESTART, () => {
    if (chain.isServerStarted()) {
      chain.once("server-stopped", () => {
        chain.startServer(Settings.getAll())
      })
      chain.stopServer()
    } else {
      chain.startServer(Settings.getAll())
    }
  })

  actionEmitter.on(REQUEST_SAVE_SETTINGS, (event, settings) => {
    Settings.setAll(settings)
  })

  return {
    setUp,
    tearDown,
    handleError
  }
}

module.exports = init
