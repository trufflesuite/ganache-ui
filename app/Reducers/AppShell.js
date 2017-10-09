import * as AppShell from 'Actions/AppShell'

const initialState = {
  scrollPosition: "top"
}

export default function (state = initialState, action) {
  switch (action.type) {
    case AppShell.SET_SCROLL_POSITION:
      return Object.assign({}, state, {
        scrollPosition: action.scrollPosition
      })

    default:
      return state
  }
}