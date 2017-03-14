import { connect } from 'react-redux'
import * as Actions from 'Data/Sources/Repl/Actions'

import { createStructuredSelector } from 'reselect'

const replSelector = state => state.repl

export default connect(createStructuredSelector({ repl: replSelector }), Actions)
