import * as ApiHelpers from 'Data/Sources/ApiHelpers'

export default {
  startRpcService: () => {
    return ApiHelpers.sendIpcMessage('APP/STARTRPC')
  }
}
