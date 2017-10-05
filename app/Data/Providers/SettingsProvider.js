import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import * as ApiHelpers from 'Data/Sources/ApiHelpers'
import { createRequestThunk } from 'Data/Sources/ActionUtils'

const Types = {
  appGetSettings: 'APP/GETSETTINGS',
  appSetSettings: 'APP/SETSETTINGS',
}

const Api = {
  getSettings: () => {
    return ApiHelpers.sendIpcMessage(Types.appGetSettings)
  },

  setSettings: settings => {
    return ApiHelpers.sendIpcMessage(Types.appSetSettings, settings)
  }
}

const Actions = {
  appGetSettings: createRequestThunk({
    request: Api.getSettings,
    key: Types.appGetSettings
  }),
  
  appSetSettings: createRequestThunk({
    request: Api.setSettings,
    key: Types.appSetSettings
  })
}

export default connect(createStructuredSelector({ settings: (state) => state.settings }), Actions)
