import DefaultState from './DefaultState'
import * as SystemRequestActions from './Actions'

import { merge } from 'ramda'
import ReduceWith from 'Data/Sources/ReduceWith'

const mutators = {
  [SystemRequestActions.markRequestPendingType]: (state, action) => {
    return merge(state, { [action.meta.key]: { status: 'pending', error: null } })
  },

  [SystemRequestActions.markRequestSuccessType]: (state, action) => {
    return merge(state, { [action.meta.key]: { status: 'success', error: null } })
  },

  [SystemRequestActions.markRequestFailedType]: (state, action) => {
    return merge(state, { [action.meta.key]: { status: 'failure', error: action.payload } })
  }
}

export default ReduceWith(mutators, DefaultState)
