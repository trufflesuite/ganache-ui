import { connect } from 'react-redux'
import * as Actions from 'Data/Sources/TestRPC/Actions'

import { createStructuredSelector } from 'reselect'

const testRpcStateSelector = state => state.testrpcsource

export default connect(createStructuredSelector({ testRpcState: testRpcStateSelector }), Actions)
