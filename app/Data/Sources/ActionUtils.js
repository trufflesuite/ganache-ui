import * as SystemRequestActions from './SystemRequests/Actions'

export const createRequestThunk = ({ request, key, start = [], success = [], failure = [] }) => {
  return (...args) => (dispatch, getState) => {
    const requestKey = (typeof key === 'function') ? key(...args) : key

    start.forEach((actionCreator) => dispatch(actionCreator()))
    dispatch(SystemRequestActions.markRequestPending(requestKey))

    return request(...args)
      .then((data) => {
        success.forEach((actionCreator) => dispatch(actionCreator(data)))
        dispatch(SystemRequestActions.markRequestSuccess(requestKey))
      })
      .catch((reason) => {
        console.error(reason)
        failure.forEach((actionCreator) => dispatch(actionCreator(reason)))
        dispatch(SystemRequestActions.markRequestFailed(reason, requestKey))
      })
  }
}
