import * as ApiHelpers from 'Data/Sources/ApiHelpers'

export default {
  getSettings: () => {
    console.log('getting settings')
    return ApiHelpers.sendIpcMessage('APP/GETSETTINGS')
  },

  setSettings: (settings) => {
    return ApiHelpers.sendIpcMessage('APP/SETSETTINGS', settings)
  }
}
