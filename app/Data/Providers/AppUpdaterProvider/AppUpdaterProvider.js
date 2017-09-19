import { connect } from 'react-redux'
import * as Actions from 'Data/Sources/AppUpdater/Actions'

import { createStructuredSelector } from 'reselect'

const appUpdaterSelector = state => state.appupdater

export default connect(createStructuredSelector({ appUpdater: appUpdaterSelector }), Actions)
