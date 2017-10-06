import { connect } from 'react-redux'

export default connect((state) => {
  return {
    core: state.core
  }
})