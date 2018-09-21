import {
  SET_WORKSPACES,
  SET_CURRENT_WORKSPACE,
  CONTRACT_DEPLOYED,
  CONTRACT_TRANSACTION,
  CONTRACT_EVENT
} from './actions'
import cloneDeep from 'lodash.clonedeep'

const initialState = {
  names: [],
  current: {}
}

export default function (state = initialState, action) {
  let nextState = cloneDeep(state)

  switch (action.type) {
    case SET_WORKSPACES:
      nextState.names = cloneDeep(action.workspaces)
      break
    case SET_CURRENT_WORKSPACE:
      nextState.current = cloneDeep(action.workspace)
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
                contract.creationHash = action.data.transactionHash
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
      nextState.current = cloneDeep(action.workspace)
      break
    default:
      break
  }

  return nextState
}