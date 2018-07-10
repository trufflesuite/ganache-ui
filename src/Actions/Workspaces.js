const prefix = 'WORKSPACES'

export const SET_WORKSPACES = `${prefix}/SET_WORKSPACES`
export const setWorkspaces = function(workspaces) {
  return {type: SET_WORKSPACES, workspaces}
}

export const OPEN_WORKSPACE = `${prefix}/OPEN_WORKSPACE`
