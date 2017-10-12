const prefix = 'SETTINGS'

export const SET_SETTINGS = `${prefix}/SET_SETTINGS`
export const setSettings = function(settings) {
  return { type: SET_SETTINGS, settings }
}