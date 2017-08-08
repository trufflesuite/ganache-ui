import * as ApiHelpers from 'Data/Sources/ApiHelpers'

export default {
  sendConsoleCommand: command => {
    return ApiHelpers.sendIpcMessage('APP/SENDREPLCOMMAND', command, command)
  },

  sendConsoleCommandCompletion: command => {
    return ApiHelpers.sendIpcMessage(
      'APP/SENDREPLCOMMANDCOMPLETION',
      command,
      command
    )
  },

  getConsoleMessages: () => {
    console.log('getting console messages')
    return ApiHelpers.sendIpcMessage('APP/GETCONSOLEMESSAGES')
  }
}
