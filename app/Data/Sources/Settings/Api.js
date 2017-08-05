import * as ApiHelpers from 'Data/Sources/ApiHelpers'

export default {
  getSettings: () => {
    return ApiHelpers.sendIpcMessage('APP/GETSETTINGS')
  },

  setSettings: settings => {
    return ApiHelpers.sendIpcMessage('APP/SETSETTINGS', settings)
  }
}
