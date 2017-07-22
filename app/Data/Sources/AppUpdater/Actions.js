import Api from './Api'
import { createRequestThunk } from 'Data/Sources/ActionUtils'

export const appSendUpdateDownloadAndUpdateType = 'APP/UPDATEDOWNLOADANDUPDATE'
export const appDownloadAndApplyUpdate = createRequestThunk({
  request: Api.sendDownloadAndUpdateCommand,
  key: appSendUpdateDownloadAndUpdateType
})
