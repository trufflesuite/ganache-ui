import { ipcRenderer } from "electron";
import { push } from "react-router-redux";

import {
  web3CleanUpHelper,
  web3ActionCreator,
} from "../web3/helpers/Web3ActionCreator";
import { REQUEST_SERVER_RESTART } from "../core/actions";
import { GET_DECODED_EVENT } from "../events/actions";

const prefix = "WORKSPACES";

const cleanupWorkspace = function(dispatch, getState) {
  web3CleanUpHelper(dispatch, getState);

  dispatch(push("/loader"));

  // Dispatch REQUEST_SERVER_RESTART to the store
  // This will clear all state.
  dispatch({ type: REQUEST_SERVER_RESTART });
};

export const SET_WORKSPACES = `${prefix}/SET_WORKSPACES`;
export const setWorkspaces = function(workspaces) {
  return { type: SET_WORKSPACES, workspaces };
};

export const CLOSE_WORKSPACE = `${prefix}/CLOSE_WORKSPACE`;
export const closeWorkspace = function() {
  return function(dispatch, getState) {
    cleanupWorkspace(dispatch, getState);

    dispatch({ type: CLOSE_WORKSPACE });
    ipcRenderer.send(CLOSE_WORKSPACE);
  };
};

export const OPEN_WORKSPACE = `${prefix}/OPEN_WORKSPACE`;
export const openWorkspace = function(name) {
  return function(dispatch) {
    dispatch(push("/loader"));
    dispatch({ type: OPEN_WORKSPACE, name });
    ipcRenderer.send(OPEN_WORKSPACE, name);
  };
};

export const openDefaultWorkspace = function() {
  return function(dispatch) {
    dispatch(push("/loader"));
    dispatch({ type: OPEN_WORKSPACE, name: null });
    ipcRenderer.send(OPEN_WORKSPACE, null);
  };
};

export const OPEN_NEW_WORKSPACE_CONFIG = `${prefix}/OPEN_NEW_WORKSPACE_CONFIG`;
export const openNewWorkspaceConfig = function() {
  return function(dispatch) {
    dispatch(push("/loader"));
    ipcRenderer.send(OPEN_NEW_WORKSPACE_CONFIG);
  };
};

export const SAVE_WORKSPACE = `${prefix}/SAVE_WORKSPACE`;
export const saveWorkspace = function(name) {
  return function(dispatch, getState) {
    const mnemonic = getState().core.mnemonic;

    cleanupWorkspace(dispatch, getState);

    dispatch({ type: SAVE_WORKSPACE, name, mnemonic: mnemonic });

    ipcRenderer.send(SAVE_WORKSPACE, name, mnemonic);
  };
};

export const DELETE_WORKSPACE = `${prefix}/DELETE_WORKSPACE`;
export const deleteWorkspace = function(name) {
  return function(dispatch) {
    dispatch({ type: DELETE_WORKSPACE, name });

    ipcRenderer.send(DELETE_WORKSPACE, name);
  };
};

export const SET_CURRENT_WORKSPACE = `${prefix}/SET_CURRENT_WORKSPACE`;
export const setCurrentWorkspace = function(workspace, contractCache) {
  return { type: SET_CURRENT_WORKSPACE, workspace, contractCache };
};

export const CONTRACT_DEPLOYED = `${prefix}/CONTRACT_DEPLOYED`;
export const contractDeployed = function(data) {
  return { type: CONTRACT_DEPLOYED, data };
};

export const CONTRACT_TRANSACTION = `${prefix}/CONTRACT_TRANSACTION`;
export const contractTransaction = function(data) {
  return { type: CONTRACT_TRANSACTION, data };
};

export const CONTRACT_EVENT = `${prefix}/CONTRACT_EVENT`;
export const contractEvent = function(data) {
  return { type: CONTRACT_EVENT, data };
};

export const GET_CONTRACT_DETAILS = `${prefix}/GET_CONTRACT_DETAILS`;
export const SET_LOADING_CONTRACT_DETAILS = `${prefix}/SET_LOADING_CONTRACT_DETAILS`;
export const getContractDetails = function(data) {
  const { transactions, events, contract, contracts, block } = data;

  return async function(dispatch, getState) {
    let shownTransactions = [];
    let shownReceipts = {};
    let shownEvents = [];

    dispatch({
      type: SET_LOADING_CONTRACT_DETAILS,
      loading: true,
    });

    const balance = await web3ActionCreator(dispatch, getState, "getBalance", [
      contract.address,
    ]);

    for (let i = 0; i < transactions.length; i++) {
      const transaction = await web3ActionCreator(
        dispatch,
        getState,
        "getTransaction",
        [transactions[i]],
      );
      shownTransactions.push(transaction);
      const receipt = await web3ActionCreator(
        dispatch,
        getState,
        "getTransactionReceipt",
        [transactions[i]],
      );
      shownReceipts[transactions[i]] = receipt;
    }

    // I was going to use the blocks inView here by just dispatching `requestPage`
    //   from the blocks redux, but that gets cleared and doesnt work well, so I'm
    //   doing it the dirty and brute force way
    let blockTimestamps = {};

    // TODO: This is shared code in redux/transactions/actions.js
    for (let i = 0; i < events.length; i++) {
      const receipt = await web3ActionCreator(
        dispatch,
        getState,
        "getTransactionReceipt",
        [events[i].transactionHash],
      );
      for (let j = 0; j < receipt.logs.length; j++) {
        if (receipt.logs[j].logIndex === events[i].logIndex) {
          const log = receipt.logs[j];

          if (typeof blockTimestamps[log.blockNumber] === "undefined") {
            const block = await web3ActionCreator(
              dispatch,
              getState,
              "getBlock",
              [log.blockNumber, false],
            );
            blockTimestamps[log.blockNumber] = block ? block.timestamp : null;
          }
          log.timestamp = blockTimestamps[log.blockNumber];

          const decodedLog = await new Promise(resolve => {
            // TODO: there's a better way to do this to not have to send `contract` and `contracts` every time
            ipcRenderer.once(GET_DECODED_EVENT, (event, decodedLog) => {
              resolve(decodedLog);
            });
            ipcRenderer.send(GET_DECODED_EVENT, contract, contracts, log);
          });

          shownEvents.push({
            ...events[i],
            log: log,
            decodedLog,
          });
          break;
        }
      }
    }

    const state = await new Promise(resolve => {
      ipcRenderer.once(GET_CONTRACT_DETAILS, (event, state) => {
        resolve(state);
      });
      ipcRenderer.send(GET_CONTRACT_DETAILS, contract, contracts, block);
    });

    dispatch({
      type: GET_CONTRACT_DETAILS,
      shownTransactions,
      shownReceipts,
      shownEvents,
      state,
      balance,
    });

    dispatch({
      type: SET_LOADING_CONTRACT_DETAILS,
      loading: false,
    });
  };
};

export const CLEAR_SHOWN_CONTRACT = `${prefix}/CLEAR_SHOWN_CONTRACT`;
export const clearShownContract = function() {
  return { type: CLEAR_SHOWN_CONTRACT };
};

export const PROJECT_UPDATED = `${prefix}/PROJECT_UPDATED`;
export const projectUpdated = function(project) {
  return { type: PROJECT_UPDATED, project };
};
