import Api from './Api'
import { createRequestThunk } from 'Data/Sources/ActionUtils'

export const appSendReplCommandType = 'APP/SENDREPLCOMMAND'
export const appSendReplCommand = createRequestThunk({
  request: Api.sendReplCommand,
  key: appSendReplCommandType,
  success: [
    (command) => {
      return {
        type: 'APP/SENDREPLCOMMAND',
        payload: command
      }
    }
  ]
})

export const appSendReplCommandCompletionType = 'APP/SENDREPLCOMMANDCOMPLETION'
export const appSendReplCommandCompletion = createRequestThunk({
  request: Api.sendReplCommandCompletion,
  key: appSendReplCommandCompletionType
})
