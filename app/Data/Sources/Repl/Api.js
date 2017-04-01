import * as ApiHelpers from 'Data/Sources/ApiHelpers'

export default {
  sendReplCommand: (command) => {
    return ApiHelpers.sendIpcMessage('APP/SENDREPLCOMMAND', command, command)
  },

  sendReplCommandCompletion: (command) => {
    return ApiHelpers.sendIpcMessage('APP/SENDREPLCOMMANDCOMPLETION', command, command)
  }
}
