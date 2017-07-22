import DefaultState from './DefaultState'

import ReduceWith from 'Data/Sources/ReduceWith'

const mutators = {
  'APP/UPDATECHECK': (state, {type, payload}) => {
    return {
      ...DefaultState,
      checkingForUpdate: true
    }
  },
  'APP/UPDATEAVAILABLE': (state, {type, payload}) => {
    return {
      ...DefaultState,
      updateAvailable: true
    }
  },
  'APP/UPDATENOTAVAILABLE': (state, {type, payload}) => {
    return {
      ...DefaultState,
      haveLatestVersion: true
    }
  },
  'APP/UPDATEERROR': (state, {type, payload}) => {
    return {
      ...DefaultState,
      updateError: payload
    }
  },
  'APP/UPDATEDOWNLOADPROGRESS': (state, {type, payload}) => {
    return {
      ...DefaultState,
      downloadingUpdate: payload
    }
  },
  'APP/UPDATEDOWNLOADED': (state, {type, payload}) => {
    return {
      ...DefaultState,
      updateDownloaded: true
    }
  }
}

export default ReduceWith(mutators, DefaultState)
