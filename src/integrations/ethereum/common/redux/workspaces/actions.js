import { ipcRenderer } from "electron";

import {
  web3ActionCreator,
} from "../web3/helpers/Web3ActionCreator";
import { GET_DECODED_EVENT } from "../events/actions";

const prefix = "WORKSPACES";

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

      // if a transaction is null it's likely because of a rollback
      if (transaction !== null) {
        shownTransactions.push(transaction);
        const receipt = await web3ActionCreator(
          dispatch,
          getState,
          "getTransactionReceipt",
          [transactions[i]],
        );
        shownReceipts[transactions[i]] = receipt;
      }
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
