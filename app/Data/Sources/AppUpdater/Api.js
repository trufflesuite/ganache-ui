import * as ApiHelpers from 'Data/Sources/ApiHelpers'

export default {
  sendDownloadAndUpdateCommand: (command) => {
    return ApiHelpers.sendIpcMessage('APP/DOWNLOADANDUPDATE', command, command)
  }
}
