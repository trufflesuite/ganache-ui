import Repl from 'repl'
import EventEmitter from 'events'

import Web3 from 'web3'

import Web3InitScript from './ConsoleService/Web3InitScript'

class ConsoleStream extends EventEmitter {
  constructor (webView) {
    super()

    this.readable = true
    this.writeable = true

    this.webView = webView

    this.streamOpen = true
  }

  closeStream () {
    this.streamOpen = false
  }

  openStream () {
    this.streamOpen = true
  }

  write (data) {
    console.log(data)
    if (data.message !== '' && this.streamOpen) {
      this.webView.send('APP/REPLSTATE', data)
    }
  }
  end () {}

  setEncoding (encoding) {}
  pause () {}
  resume () {}
  destroy () {
    this.webView = null
  }
  destroySoon () {}
}

export default class ConsoleService {
  constructor (ipcMain, webView) {
    this.ipcMain = ipcMain
    this.webView = webView
    this.consoleStream = new ConsoleStream(webView)
    this.consoleStream.closeStream()

    this._console = Repl.start({
      prompt: '',
      input: this.consoleStream,
      output: this.consoleStream
    })

    ipcMain.on('APP/SENDREPLCOMMAND', this.sendConsoleInput)
    ipcMain.on('APP/SENDREPLCOMMANDCOMPLETION', this._handleCommandCompletion)
  }

  log = message => {
    console.log(message)
    this.consoleStream.write({
      message,
      level: 'log',
      time: new Date().toISOString()
    })
  }

  info = message => {
    console.info(message)
    this.consoleStream.write({
      message,
      level: 'info',
      time: new Date().toISOString()
    })
  }

  warning = message => {
    console.warning(message)
    this.consoleStream.write({
      message,
      level: 'warning',
      time: new Date().toISOString()
    })
  }

  error = message => {
    console.error(message)
    this.consoleStream.write({
      message,
      level: 'error',
      time: new Date().toISOString()
    })
  }

  initializeWeb3Scripts = (host, port) => {
    this._console.context['Web3'] = Web3
    new Web3InitScript(host, port).exportedScript().then(bootScript => {
      this.consoleStream.emit('data', bootScript)
      this.consoleStream.openStream()
    })
  }

  _handleCommandCompletion = (e, cmd) => {
    this._console.complete(cmd, (err, completions) => {
      if (err) {
        console.log(err)
      }

      const payload = { completions: completions }
      this.webView.send('APP/REPLCOMMANDCOMPLETIONRESULT', payload)
    })
  }

  setConsoleContextItem = (key, value) => {
    console.log('Setting REPL context: ' + key + '=' + JSON.stringify(value))
    this._console.context[key] = value
  }

  sendConsoleInput = (e, input) => {
    if (!input.match(/^\..+/)) {
      this.consoleStream.emit('data', input + '\n')

      if (input === 'clear()') {
        this.webView.send('APP/REPLCLEAR')
      }
    }
  }
}
