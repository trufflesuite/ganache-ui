import Api from './Api'
import { createRequestThunk } from 'Data/Sources/ActionUtils'

export const appSendConsoleCommandType = 'APP/SENDREPLCOMMAND'
export const appSendConsoleCommand = createRequestThunk({
  request: Api.sendConsoleCommand,
  key: appSendConsoleCommandType,
  success: [
    (command) => {
      return {
        type: 'APP/SENDREPLCOMMAND',
        payload: command
      }
    }
  ]
})

export const appSendConsoleCommandCompletionType = 'APP/SENDREPLCOMMANDCOMPLETION'
export const appSendConsoleCommandCompletion = createRequestThunk({
  request: Api.sendConsoleCommandCompletion,
  key: appSendConsoleCommandCompletionType
})
