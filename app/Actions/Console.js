// import { createRequestThunk } from './ActionUtils'

// const Api = {
//   sendConsoleCommand: command => {
//     return ApiHelpers.sendIpcMessage('APP/SENDREPLCOMMAND', command, command)
//   },

//   sendConsoleCommandCompletion: command => {
//     return ApiHelpers.sendIpcMessage(
//       'APP/SENDREPLCOMMANDCOMPLETION',
//       command,
//       command
//     )
//   },

//   getConsoleMessages: () => {
//     return ApiHelpers.sendIpcMessage('APP/GETCONSOLEMESSAGES')
//   }
// }

// export const appSendConsoleCommandType = 'APP/SENDREPLCOMMAND'
// export const appSendConsoleCommand = createRequestThunk({
//   request: Api.sendConsoleCommand,
//   key: appSendConsoleCommandType,
//   success: [
//     command => {
//       return {
//         type: 'APP/SENDREPLCOMMAND',
//         payload: command
//       }
//     }
//   ]
// })

// export const appSendConsoleCommandCompletionType =
//   'APP/SENDREPLCOMMANDCOMPLETION'
// export const appSendConsoleCommandCompletion = createRequestThunk({
//   request: Api.sendConsoleCommandCompletion,
//   key: appSendConsoleCommandCompletionType
// })

// export const appGetConsoleMessagesType = 'APP/GETCONSOLEMESSAGES'
// export const appGetConsoleMessages = createRequestThunk({
//   request: Api.getConsoleMessages,
//   key: appGetConsoleMessagesType
// })
