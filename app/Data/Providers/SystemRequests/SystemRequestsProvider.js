import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'

export const getRequest = (state, key) =>
  state.systemrequests[key] || {}

export const getRequests = (state) =>
  state.systemrequests

export const areRequestsPending = (requests) => {
  return Object.keys(requests).some((key) => requests[key].status === 'pending')
}

export const SpecificSystemRequestProvider = (key) => {
  const propName = (key + 'RequestsPending').split('/')[1]
  let specificSelect = createStructuredSelector({
    [propName]: (state) => getRequest(state, key).status === 'pending'
  })

  return connect(specificSelect)
}

let select = createStructuredSelector({
  requestsPending: (state) => areRequestsPending(getRequests(state))
})

export default connect(select)
