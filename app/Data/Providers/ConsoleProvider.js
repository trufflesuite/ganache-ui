import { connect } from 'react-redux'
import * as Actions from 'Actions/Console'
import _ from 'lodash'

export default connect((state) => {
  return _.merge({}, Actions, {
    console: state.console, 
  })
}, Actions)
