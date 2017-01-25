import { connect } from 'react-redux'
import * as Actions from 'Data/Sources/TestRPC/Actions'

const testRpcStateSelector = state => state.testrpcsource

export default connect(testRpcStateSelector, Actions)
