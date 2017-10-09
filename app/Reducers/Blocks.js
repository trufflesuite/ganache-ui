import * as Blocks from 'Actions/Blocks'

const initialState = {
  inView: [],
  requested: {}
}

// Note: This sorts in reverse; higher blocks first
function sort(blocks) {
  return blocks.sort(function(a, b) {
    if (a.number > b.number) {
      return -1;
    }
    if (a.number < b.number) {
      return 1;
    }
    // a must be equal to b
    return 0;
  })
}

export default function (state = initialState, action) {
  switch (action.type) {
    case Blocks.CLEAR_BLOCKS_IN_VIEW:
      return Object.assign({}, state, {
        inView: [],
        requested: {}
      })
    case Blocks.SET_BLOCK_REQUESTED:
      var requested = Object.assign({}, state.requested, {
        [action.number]: true
      })
      return Object.assign({}, state, {
        requested
      })
    case Blocks.ADD_BLOCK_TO_VIEW: 
      let blocks = state.inView.concat([action.block])
      return Object.assign({}, state, {
        inView: sort(blocks)
      })
    default:
      return state
  }
}
