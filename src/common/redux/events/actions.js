import { ipcRenderer } from 'electron'

import { web3ActionCreator } from '../web3/helpers/Web3ActionCreator'

const prefix = 'EVENTS'

export const GET_DECODED_EVENT = `${prefix}/GET_DECODED_EVENT`
export const getDecodedEvent = function(transactionHash, logIndex) {
  return async function(dispatch, getState) {
    let event

    const transaction = await web3ActionCreator(dispatch, getState, "getTransaction", [transactionHash])
    const receipt = await web3ActionCreator(dispatch, getState, "getTransactionReceipt", [transactionHash])

    let contract
    let contractName
    let contractAddress = transaction.to
    let projectIndex
    const state = getState()
    for (let i = 0; i < state.workspaces.current.projects.length; i++) {
      const project = state.workspaces.current.projects[i]
      for (let j = 0; j < project.contracts.length; j++) {
        const tempContract = project.contracts[j]
        if (tempContract.address && tempContract.address === transaction.to) {
          contract = tempContract
          projectIndex = i
          break
        }
      }

      if (contract) {
        contractName = contract.contractName
        break
      }
    }

    if (contract) {
      // TODO: This is shared code in redux/workspaces/actions.js
      for (let j = 0; j < receipt.logs.length; j++) {
        if (receipt.logs[j].logIndex === logIndex) {
          const decodedLog = await new Promise((resolve, reject) => {
            // TODO: there's a better way to do this to not have to send `contract` and `contracts` every time
            ipcRenderer.once(GET_DECODED_EVENT, (event, decodedLog) => {
              resolve(decodedLog)
            })
            ipcRenderer.send(GET_DECODED_EVENT, contract, state.workspaces.current.projects[projectIndex].contracts, receipt.logs[j])
          })

          event = {
            transactionHash,
            logIndex,
            log: receipt.logs[j],
            decodedLog
          }

          break
        }
      }
    }

    dispatch({ type: GET_DECODED_EVENT, event, contractName, contractAddress })
  }
}
