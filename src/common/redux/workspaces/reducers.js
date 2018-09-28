import {
  SET_WORKSPACES,
  SET_CURRENT_WORKSPACE,
  CONTRACT_DEPLOYED,
  CONTRACT_TRANSACTION,
  CONTRACT_EVENT,
  GET_CONTRACT_DETAILS,
  CLEAR_SHOWN_CONTRACT
} from './actions'
import cloneDeep from 'lodash.clonedeep'

const initialState = {
  names: [],
  current: {}
}

const initialShownContract = {
  shownTransactions: [],
  shownReceipts: {},
  shownEvents: [],
  state: {},
  balance: "0"
}

export default function (state = initialState, action) {
  let nextState = cloneDeep(state)

  switch (action.type) {
    case SET_WORKSPACES:
      nextState.names = cloneDeep(action.workspaces)
      break
    case SET_CURRENT_WORKSPACE:
      nextState.current = cloneDeep(action.workspace)
      nextState.current.shownContract = cloneDeep(initialShownContract)
      break
    case CONTRACT_DEPLOYED:
      if (typeof nextState.current.projects !== "undefined") {
        for (let i = 0; i < nextState.current.projects.length; i++) {
          const project = nextState.current.projects[i]
          if (project.truffle_directory === action.data.truffleDirectory) {
            for (let j = 0; j < project.contracts.length; j++) {
              const contract = project.contracts[j]
              if (contract.contractName === action.data.contractName) {
                contract.address = action.data.contractAddress
                contract.creationTxHash = action.data.transactionHash
                contract.transactions = []
                contract.events = []
                break
              }
            }
            break
          }
        }
      }
      break
    case CONTRACT_TRANSACTION:
      if (typeof nextState.current.projects !== "undefined") {
        for (let i = 0; i < nextState.current.projects.length; i++) {
          const project = nextState.current.projects[i]
          if (project.truffle_directory === action.data.truffleDirectory) {
            for (let j = 0; j < project.contracts.length; j++) {
              const contract = project.contracts[j]
              if (contract.address === action.data.contractAddress) {
                if (Array.isArray(contract.transactions)) {
                  contract.transactions.push(action.data.transactionHash)
                }
                else {
                  contract.transactions = [ action.data.transactionHash ]
                }
                break
              }
            }
            break
          }
        }
      }
      break
    case CONTRACT_EVENT:
      if (typeof nextState.current.projects !== "undefined") {
        for (let i = 0; i < nextState.current.projects.length; i++) {
          const project = nextState.current.projects[i]
          if (project.truffle_directory === action.data.truffleDirectory) {
            for (let j = 0; j < project.contracts.length; j++) {
              const contract = project.contracts[j]
              if (contract.address === action.data.contractAddress) {
                const event = {
                  transactionHash: action.data.transactionHash,
                  logIndex: action.data.logIndex
                }
                if (Array.isArray(contract.events)) {
                  contract.events.push(event)
                }
                else {
                  contract.events = [ event ]
                }
                break
              }
            }
            break
          }
        }
      }
      break
    case GET_CONTRACT_DETAILS:
      nextState.current.shownContract.shownTransactions = cloneDeep(action.shownTransactions)
      nextState.current.shownContract.shownReceipts = cloneDeep(action.shownReceipts)
      nextState.current.shownContract.shownEvents = cloneDeep(action.shownEvents)
      nextState.current.shownContract.state = cloneDeep(action.state)
      nextState.current.shownContract.balance = action.balance
      break
    case CLEAR_SHOWN_CONTRACT:
      nextState.current.shownContract = cloneDeep(initialShownContract)
      break
    default:
      break
  }

  return nextState
}