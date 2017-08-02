import Api from './Api'
import { createRequestThunk } from 'Data/Sources/ActionUtils'

export const appGetSettingsType = 'APP/GETSETTINGS'
export const appGetSettings = createRequestThunk({
  request: Api.getSettings,
  key: appGetSettingsType
})

export const appSetSettingsType = 'APP/SETSETTINGS'
export const appSetSettings = createRequestThunk({
  request: Api.setSettings,
  key: appSetSettingsType
})
