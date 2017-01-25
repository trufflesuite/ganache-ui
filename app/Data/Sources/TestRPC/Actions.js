import Api from './Api'
import { createRequestThunk } from 'Data/Sources/ActionUtils'

export const appStartRpcServiceType = 'APP/STARTRPC'
export const appStartRpcService = createRequestThunk({
  request: Api.startRpcService,
  key: appStartRpcServiceType,
  success: []
})
