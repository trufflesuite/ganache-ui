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

    const _repl = Repl.REPLServer(
      'testrpc > ',
      this.replStream
    )
    Object.defineProperty(this, 'repl', {
      enumerable: false,
      get: () => _repl
    })
  }

  getReplContents = () => {
    return this.replStream.messages
  }

  sendReplInput = (input) => {
    this.replStream.emit('data', input + '\n')
  }

}
