import {
  SET_WORKSPACES,
  SET_CURRENT_WORKSPACE,
  CONTRACT_TRANSACTION,
  CONTRACT_EVENT,
  GET_CONTRACT_DETAILS,
  CLEAR_SHOWN_CONTRACT,
  PROJECT_UPDATED,
  SET_LOADING_CONTRACT_DETAILS,
} from "./actions";
import cloneDeep from "lodash.clonedeep";

const initialState = {
  names: [],
  current: {},
};

const initialShownContract = {
  shownTransactions: [],
  shownReceipts: {},
  shownEvents: [],
  state: {},
  balance: "0",
  loading: false,
};

function linkContractCacheToProject(contractCache, project) {
  for (let j = 0; j < project.contracts.length; j++) {
    const contract = project.contracts[j];

    if (typeof contractCache[contract.address] === "undefined") {
      contractCache[contract.address] = {
        transactions: [],
        events: [],
      };
    }
    contractCache[contract.address].contract = contract;
  }
}

export default function(state = initialState, action) {
  let nextState = cloneDeep(state);

  switch (action.type) {
    case SET_WORKSPACES:
      nextState.names = cloneDeep(action.workspaces);
      break;
    case SET_CURRENT_WORKSPACE:
      nextState.current = cloneDeep(action.workspace);
      nextState.current.shownContract = cloneDeep(initialShownContract);
      nextState.current.contractCache = cloneDeep(action.contractCache);

      for (let i = 0; i < nextState.current.projects.length; i++) {
        const project = nextState.current.projects[i];
        if (typeof project.error === "undefined") {
          linkContractCacheToProject(nextState.current.contractCache, project);
        }
      }
      break;
    case CONTRACT_TRANSACTION: {
      if (
        typeof nextState.current.contractCache[action.data.contractAddress] ===
        "undefined"
      ) {
        nextState.current.contractCache[action.data.contractAddress] = {
          transactions: [],
          events: [],
        };
      }
      const contract =
        nextState.current.contractCache[action.data.contractAddress];

      if (contract.transactions.indexOf(action.data.transactionHash) === -1) {
        contract.transactions.push(action.data.transactionHash);
      }

      break;
    }
    case CONTRACT_EVENT: {
      if (
        typeof nextState.current.contractCache[action.data.contractAddress] ===
        "undefined"
      ) {
        nextState.current.contractCache[action.data.contractAddress] = {
          transactions: [],
          events: [],
        };
      }

      const contract =
        nextState.current.contractCache[action.data.contractAddress];
      const event = {
        transactionHash: action.data.transactionHash,
        logIndex: action.data.logIndex,
      };

      const existingEventsInCache = contract.events.filter(e => {
        return (
          e.transactionHash === event.transactionHash &&
          e.logIndex === event.logIndex
        );
      });

      if (existingEventsInCache.length === 0) {
        contract.events.push(event);
      }

      break;
    }
    case GET_CONTRACT_DETAILS:
      nextState.current.shownContract.shownTransactions = cloneDeep(
        action.shownTransactions,
      );
      nextState.current.shownContract.shownReceipts = cloneDeep(
        action.shownReceipts,
      );
      nextState.current.shownContract.shownEvents = cloneDeep(
        action.shownEvents,
      );
      nextState.current.shownContract.state = cloneDeep(action.state);
      nextState.current.shownContract.balance = action.balance;
      break;
    case CLEAR_SHOWN_CONTRACT:
      nextState.current.shownContract = cloneDeep(initialShownContract);
      break;
    case PROJECT_UPDATED: {
      for (let i = 0; i < nextState.current.projects.length; i++) {
        if (
          nextState.current.projects[i].configFile === action.project.configFile
        ) {
          // found the project we'd like to update
          nextState.current.projects[i] = action.project;
          linkContractCacheToProject(
            nextState.current.contractCache,
            nextState.current.projects[i],
          );
          break;
        }
      }
      break;
    }
    case SET_LOADING_CONTRACT_DETAILS: {
      nextState.current.shownContract.loading = action.loading;
    }
    default:
      break;
  }

  return nextState;
}
