import { connect } from 'react-redux'
import * as Actions from 'Data/Sources/Settings/Actions'

import { createStructuredSelector } from 'reselect'

const settingsSelector = state => state.settings

export default connect(createStructuredSelector({ settings: settingsSelector }), Actions)
