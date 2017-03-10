import Repl from 'repl'
import EventEmitter from 'events'

class ReplStream extends EventEmitter {
  constructor () {
    super()

    this.messages = []
    this.readable = true
    this.writeable = true
  }

  write (data) {
    this.messages.push(data)
  }
  end () {}

  setEncoding (encoding) {}
  pause () {}
  resume () {}
  destroy () {
    this.messages = null
  }
  destroySoon () {}

}

export default class ReplService {
  constructor () {
    this.replStream = new ReplStream()

    this._repl = Repl.start({
      prompt: '',
      input: this.replStream,
      output: this.replStream
    })
  }

  setReplContextItem = (key, value) => {
    console.log('Setting REPL context: ' + key + '=' + value)
    this._repl.context[key] = value
  }

  getReplContents = () => {
    return this.replStream.messages.shift()
  }

  sendReplInput = (input) => {
    this.replStream.emit('data', input + '\n')
  }

}
