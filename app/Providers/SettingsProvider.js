import { connect } from 'react-redux'

import * as ApiHelpers from 'Actions/ApiHelpers'
import { createRequestThunk } from 'Actions/ActionUtils'

const GETSETTINGS = 'APP/GETSETTINGS'
const SETSETTINGS = 'APP/SETSETTINGS'

export default connect((state) => {
  return {
    settings: state.settings,

    appGetSettings: createRequestThunk({
      request:() => {
        return ApiHelpers.sendIpcMessage(GETSETTINGS)
      },
      key: GETSETTINGS
    }),
    
    appSetSettings: createRequestThunk({
      request: (settings) => {
        return ApiHelpers.sendIpcMessage(SETSETTINGS, settings)
      },
      key: SETSETTINGS
    })
  }
})
