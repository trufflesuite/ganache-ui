import { connect } from 'react-redux'
import * as Actions from 'Data/Sources/Console/Actions'

import { createStructuredSelector } from 'reselect'

const consoleSelector = state => state.console

export default connect(createStructuredSelector({ console: consoleSelector }), Actions)
