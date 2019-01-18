import { ipcRenderer } from "electron";

import { web3ActionCreator } from "../web3/helpers/Web3ActionCreator";

const prefix = "EVENTS";
const PAGE_SIZE = 10;

export const ADD_EVENTS_TO_VIEW = `${prefix}/ADD_EVENTS_TO_VIEW`;
export const CLEAR_EVENTS_IN_VIEW = `${prefix}/CLEAR_EVENTS_IN_VIEW`;
export const SET_BLOCKS_REQUESTED = `${prefix}/SET_BLOCKS_REQUESTED`;
export const clearEventsInView = function() {
  return { type: CLEAR_EVENTS_IN_VIEW, events: [] };
};

export const SET_SUBSCRIBED_TOPICS = `${prefix}/SET_SUBSCRIBED_TOPICS`;
export const setSubscribedTopics = function(topics) {
  return { type: SET_SUBSCRIBED_TOPICS, topics };
};

export const SET_LOADING = `${prefix}/SET_LOADING`;
export const requestPage = function(startBlockNumber, endBlockNumber) {
  endBlockNumber = endBlockNumber || 0;
  return async function(dispatch, getState) {
    if (startBlockNumber == null) {
      startBlockNumber = getState().core.latestBlock;
    }

    let earliestBlockToRequest = Math.max(
      startBlockNumber - PAGE_SIZE,
      endBlockNumber,
    );

    dispatch({
      type: SET_BLOCKS_REQUESTED,
      start: earliestBlockToRequest,
      end: startBlockNumber,
    });

    dispatch({
      type: SET_LOADING,
      loading: true,
    });

    // I was going to use the blocks inView here by just dispatching `requestPage`
    //   from the blocks redux, but that gets cleared and doesnt work well, so I'm
    //   doing it the dirty and brute force way
    let blockTimestamps = {};
    for (let i = earliestBlockToRequest; i <= startBlockNumber; i++) {
      const block = await web3ActionCreator(dispatch, getState, "getBlock", [
        i,
        false,
      ]);
      blockTimestamps[i] = block ? block.timestamp : null;
    }

    let logs = await web3ActionCreator(dispatch, getState, "getPastLogs", [
      {
        fromBlock: earliestBlockToRequest,
        toBlock: startBlockNumber,
      },
    ]);

    const subscribedTopics = getState().events.subscribedTopics;

    logs = logs.filter(log => {
      for (let i = 0; i < log.topics.length; i++) {
        if (subscribedTopics.indexOf(log.topics[i]) >= 0) {
          return true;
        }
      }
      return false;
    });

    const contractCache = getState().workspaces.current.contractCache;
    const projects = getState().workspaces.current.projects;
    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      const cache = contractCache[log.address];
      log.timestamp = blockTimestamps[log.blockNumber];

      if (cache && cache.contract) {
        const contract = cache.contract;
        const projectContracts = projects[contract.projectIndex].contracts;
        const decodedLog = await new Promise(resolve => {
          // TODO: there's a better way to do this to not have to send `contract` and `contracts` every time
          ipcRenderer.once(GET_DECODED_EVENT, (event, decodedLog) => {
            resolve(decodedLog);
          });
          ipcRenderer.send(GET_DECODED_EVENT, contract, projectContracts, log);
        });

        if (decodedLog) {
          log.name = decodedLog.name;
          log.contract = contract.contractName;
        }
      }
    }

    dispatch({ type: ADD_EVENTS_TO_VIEW, events: logs });

    dispatch({
      type: SET_LOADING,
      loading: false,
    });
  };
};

// The "next" page is the next set of blocks, from the last requested down to 0
export const requestNextPage = function() {
  return function(dispatch, getState) {
    var blocksRequested = Object.keys(getState().events.blocksRequested);
    var earliestBlockRequested = Math.min.apply(Math, blocksRequested);
    dispatch(requestPage(earliestBlockRequested - 1));
  };
};

export const requestPreviousPage = function() {
  return function(dispatch, getState) {
    var blocksRequested = Object.keys(getState().events.blocksRequested);

    if (blocksRequested.length == 0) {
      return dispatch(requestPage(getState().core.latestBlock));
    }

    var latestBlockRequested = Math.max.apply(Math, blocksRequested);
    var latestBlock = getState().core.latestBlock;

    var startBlock = Math.min(latestBlock, latestBlockRequested + PAGE_SIZE);
    var endBlock = latestBlockRequested + 1;

    dispatch(requestPage(startBlock, endBlock));
  };
};

export const GET_DECODED_EVENT = `${prefix}/GET_DECODED_EVENT`;
export const getDecodedEvent = function(transactionHash, logIndex) {
  return async function(dispatch, getState) {
    let event;

    const transaction = await web3ActionCreator(
      dispatch,
      getState,
      "getTransaction",
      [transactionHash],
    );
    const receipt = await web3ActionCreator(
      dispatch,
      getState,
      "getTransactionReceipt",
      [transactionHash],
    );

    const block = await web3ActionCreator(dispatch, getState, "getBlock", [
      transaction.blockNumber,
      false,
    ]);

    let contract;
    const state = getState();

    // TODO: This is shared code in redux/workspaces/actions.js
    for (let j = 0; j < receipt.logs.length; j++) {
      if (receipt.logs[j].logIndex === logIndex) {
        event = {
          transactionHash,
          logIndex,
          log: {
            ...receipt.logs[j],
            timestamp: block.timestamp,
          },
          decodedLog: null,
        };

        break;
      }
    }

    let isSubscribedTopic = false;
    for (let k = 0; k < event.log.topics.length; k++) {
      if (state.events.subscribedTopics.indexOf(event.log.topics[k]) >= 0) {
        isSubscribedTopic = true;
        break;
      }
    }

    const contractCache =
      state.workspaces.current.contractCache[event.log.address];
    if (contractCache) {
      contract = contractCache.contract;
    }

    if (contract && isSubscribedTopic) {
      event.decodedLog = await new Promise(resolve => {
        // TODO: there's a better way to do this to not have to send `contract` and `contracts` every time
        ipcRenderer.once(GET_DECODED_EVENT, (event, decodedLog) => {
          resolve(decodedLog);
        });
        ipcRenderer.send(
          GET_DECODED_EVENT,
          contract,
          state.workspaces.current.projects[contract.projectIndex].contracts,
          event.log,
        );
      });
    }

    dispatch({
      type: GET_DECODED_EVENT,
      event,
      contractName: contract ? contract.contractName : null,
      contractAddress: event.log.address,
    });
  };
};
