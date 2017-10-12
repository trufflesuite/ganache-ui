import * as Core from 'Actions/Core'

const MAX_BLOCKS = 10
const MAX_TRANSACTIONS = 10

const initialState = {
  started: false,
  isMining: true,
  mnemonic: "",
  hdPath: "",
  privateKeys: {},
  latestBlock: 0, // Block the current chain is on
  lastRequestedBlock: -1, // Last block whose data was requested
  gasPrice: "0",
  gasLimit: "0",
  snapshots: [],
  systemError: null,
  blocks: [], 
  transactions: [],
}

export default function (state = initialState, action) {
  switch (action.type) {
    case Core.SET_SERVER_STARTED:
      return Object.assign({}, state, {
        started: true
      })
    case Core.SET_KEY_DATA:
      return Object.assign({}, state, {
        mnemonic: action.mnemonic,
        hdPath: action.hdPath,
        privateKeys: action.privateKeys
      })
    case Core.SET_LAST_REQUESTED_BLOCK_NUMBER:
      return Object.assign({}, state, {
        lastRequestedBlock: action.number
      })
    
    case Core.GET_ACCOUNTS:
      var accounts = action.accounts
      var accountBalances = Object.assign({}, state.accountBalances)
      var accountNonces = Object.assign({}, state.accountNonces)

      // Set default balance to zero if this is a new account
      accounts.forEach((account) => {
        if (!accountBalances[account]) accountBalances[account] = "0"
        if (!accountNonces[account]) accountNonces[account] = 0
      })

      return Object.assign({}, state, {
        accounts, 
        accountBalances,
        accountNonces
      })

    case Core.GET_ACCOUNT_BALANCE:
      var accountBalances = Object.assign({}, state.accountBalances, {
        [action.account]: action.balance
      })
      return Object.assign({}, state, {
        accountBalances
      })

    case Core.GET_ACCOUNT_NONCE:
      var accountNonces = Object.assign({}, state.accountNonces, {
        [action.account]: action.nonce
      })
      return Object.assign({}, state, {
        accountNonces
      }) 

    case Core.SET_GAS_PRICE: 
      return Object.assign({}, state, {
        gasPrice: action.gasPrice
      })

    case Core.SET_GAS_LIMIT:
      return Object.assign({}, state, {
        gasLimit: action.gasLimit
      })

    case Core.SET_BLOCK_NUMBER:
    case Core.GET_BLOCK_NUMBER: // TODO: Remove GET_BLOCK_NUMBER
      return Object.assign({}, state, {
        latestBlock: action.number
      })
    
    case Core.GET_BLOCK:
      // Add the block to the list
      var block = action.block
      var blocks = [block].concat(state.blocks)
      
      // Cut old blocks
      while (blocks.length > MAX_BLOCKS) {
        blocks.pop()
      }

      // Add the block's transactions to the list
      var transactions = block.transactions.concat(state.transactions)

      // Cut old transactions
      while (transactions.length > MAX_TRANSACTIONS) {
        transactions.pop()
      }

      return Object.assign({}, state, {
        blocks,
        transactions
      })

    default:
      return state
  }
}