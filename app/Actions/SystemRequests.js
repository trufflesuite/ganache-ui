export const markRequestPendingType = 'app/markRequestPending'
export const markRequestPending = (key) => ({
  type: markRequestPendingType,
  meta: { key }
})

export const markRequestSuccessType = 'app/markRequestSuccess'
export const markRequestSuccess = (key) => ({
  type: markRequestSuccessType,
  meta: { key }
})

export const markRequestFailedType = 'app/markRequestFailed'
export const markRequestFailed = (reason, key) => ({
  type: markRequestFailedType,
  payload: reason,
  meta: { key }
})
