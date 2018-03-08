import path from 'path'

import {
  REQUEST_ACTION_HISTORY,
  REQUEST_SERVER_RESTART,
  SET_SERVER_STARTED,
  SET_SERVER_STOPPED,
  SET_KEY_DATA,
  SET_SYSTEM_ERROR
} from '../Actions/Core'
import { REQUEST_SAVE_SETTINGS, SET_SETTINGS } from '../Actions/Settings'
import { ADD_LOG_LINES } from '../Actions/Logs'

import ChainService from '../Services/Chain'
import SettingsService from '../Services/Settings'
import ActionHistory from '../Services/ActionHistory'

function init(actionEmitter) {
  const chain = new ChainService()
  const Settings = new SettingsService()

  Settings.bootstrap();

  const maxActionHistoryPerType = Settings.get('maxActionHistoryPerType')
  const actionHistory = new ActionHistory(maxActionHistoryPerType, {
    [SET_KEY_DATA]: 1,
    [SET_SERVER_STARTED]: 1,
    [SET_SYSTEM_ERROR]: 1,
    [SET_SETTINGS]: 1
  })

  function setUp() {
    chain.on("start", () => {
      chain.startServer(Settings.getAll().server)
    })

    chain.on("server-started", (data) => {
      actionHistory.add(SET_KEY_DATA, {
        privateKeys: data.privateKeys,
        mnemonic: data.mnemonic,
        hdPath: data.hdPath
      })

      Settings.handleNewMnemonic(data.mnemonic)

      actionHistory.add(SET_SERVER_STARTED, Settings.getAll())
    })

    const chainLogger = (level, data) => {
      const lines = data.split(/\n/g)
      actionHistory.add(ADD_LOG_LINES, lines)
      if (process.env.NODE_ENV === 'development') {
        lines.map((line) => console[level]('ChainService:', line))
      }
    }

    chain.on("stdout", (data) => chainLogger('log', data))

    chain.on("stderr", (data) => chainLogger('error', data))

    chain.on("error", (error) => {
      console.log(error)
      actionHistory.add(SET_SYSTEM_ERROR, error)
    })

    chain.start()
  }

  function tearDown() {
    chain.stopProcess();
  }

  function handleError(err) {
    if (err) {
      actionHistory.add(SET_SYSTEM_ERROR, err.stack || err)
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
    actionHistory.add(SET_SETTINGS, settings)
  })

  actionEmitter.on(REQUEST_ACTION_HISTORY, (event) => {
    actionHistory.forEach(({ type, payload }) => event.sender.send(type, payload))
  })

  return {
    setUp,
    tearDown,
    handleError
  }
}

module.exports = init
