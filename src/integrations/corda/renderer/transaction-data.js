import {remote} from "electron";
const dialog = remote.dialog;
import { resolve } from "path";
import { ipcRenderer } from "electron";
import bs58 from "bs58";
import { Pool } from "pg";
import { Buffer } from "safe-buffer";

function convertTxHashToId(txhash) {
  return bs58.decode(txhash).toString("hex").toUpperCase();
}
function convertTransactionIdToHash(transactionId) {
  const bytes = Buffer.from(transactionId, "hex");
  return bs58.encode(bytes);
}
const pools = new Map();
function getConnectedClient(database, port) {
  let pool;
  const key = `${database}:${port}`;
  if (!pools.has(key)){
    pool = new Pool({
      user: "postgres",
      host: "localhost",
      password: "",
      database,
      port
    });
    pool.on("error", console.log);
    pools.set(key, pool);
  } else {
    pool = pools.get(key);
  }
  return new Promise((resolve, reject) => {
    pool.connect((err, client, done) => {
      if(err)  return reject(err);
      resolve(client, done);
    });
  });
}

async function queryForTxHashIndexes(txhash, node, port, canceller) {
  let res;
  const txId = convertTxHashToId(txhash);
  const client = await getConnectedClient(node.safeName, port);
  try {
    if (canceller.cancelled) {return;}

    res = await client.query(`SELECT output_index FROM vault_states WHERE transaction_id = $1::text`, [txId]);
  } finally {
    client.release();
  }
  return res.rows.map(r => r.output_index);
}

async function getAllTransactions(nodes, allNodes, port, canceller = {cancelled: false}) {
  const transactions = new Map();
  await Promise.all(nodes.map(async node => {
    const client = await getConnectedClient(node.safeName, port, canceller);
    let res;
    try {
      if (canceller.cancelled) return;

      // get all transactions this client knows about
      res = await client.query(`SELECT distinct(transaction_id) transaction_id FROM vault_states GROUP BY transaction_id`);
    } finally {
      client.release();
    }
    if (canceller.cancelled) return;

    // iterate over all the found transactions, and make sure they are completely filled in from states from all
    // nodes
    await Promise.all(res.rows.map(row => {
      const tx = new TransactionData(convertTransactionIdToHash(row.transaction_id));
      if (transactions.has(tx.txhash)) return;

      transactions.set(tx.txhash, tx);
      return tx.update(allNodes, port, canceller);
    }));
  }));
  return [...transactions.values()];
}

export default class TransactionData {
  static getConnectedClient = getConnectedClient
  static convertTxHashToId = convertTxHashToId
  static convertTransactionIdToHash = convertTransactionIdToHash
  
  constructor(txhash) {
    this.txhash = txhash;
    this.states = new Map();
    this.earliestRecordedTime = undefined;
    this.observers = new Set();
    this.notaries = new Set();
  }

  static async downloadAttachment(name, attachment_id, database) {
    const toLocalPath = resolve(remote.app.getPath("downloads"), name);

    const userChosenPath = await dialog.showSaveDialog({ defaultPath: toLocalPath });

    if (userChosenPath && !userChosenPath.canceled) {
      const destination = userChosenPath.filePath;
      const downloadSuccessPromise = new Promise(resolve => {
        ipcRenderer.on("CORDA_DOWNLOAD_ATTACHMENT_SUCCESS", function msg(_event, _attachment_id, _database, _destination) {
          if (attachment_id == _attachment_id && database == _database && destination == _destination) {
            ipcRenderer.removeListener("CORDA_DOWNLOAD_ATTACHMENT_SUCCESS", msg);
            resolve("Download complete!");
          }
        });
      });
      ipcRenderer.send("CORDA_DOWNLOAD_ATTACHMENT", attachment_id, database, destination);
      return downloadSuccessPromise;
    }
  }

  async fetchDetails(nodes, port, cordappHashMap) {
    const txhash = this.txhash;

    // get the data that knows about attachments
    const rawTransactionDataPromise = new Promise(resolve => {
      ipcRenderer.on("CORDA_TRANSACTION_DATA", function msg(_event, msgTxhash, data) {
        if (msgTxhash === txhash) {
          ipcRenderer.removeListener("CORDA_TRANSACTION_DATA", msg);
          resolve(data);
        }
      });
    });
    ipcRenderer.send("CORDA_REQUEST_TRANSACTION", txhash);

    // finally, wait for the raw transaction data
    const rawTransactionData = await rawTransactionDataPromise;
    if (rawTransactionData && rawTransactionData.wire) {
      if (!rawTransactionData.wire.attachments) {
        rawTransactionData.wire.attachments = [];
      }
      if (!rawTransactionData.wire.inputs) {
        rawTransactionData.wire.inputs = [];
      }
      const wire = rawTransactionData.wire;
      const commandClasses = wire.commands.map(command => {
        return command && command.value ? command.value["@class"].split("$")[0] : null;
      });

      if (commandClasses.length) {
        const hashes = [];
        await Promise.all(nodes.map(async node => {
          const client = await getConnectedClient(node.safeName, port);
          try {
            const result = await client.query("SELECT att_id AS hash, contract_class_name AS name FROM node_attachments_contracts WHERE contract_class_name = ANY($1::text[])", [commandClasses.filter(c => c !== null)])
            if (result.rows.length) {
              result.rows.forEach(row => {
                if (hashes.some(({hash, name}) => row.hash === hash && row.name === name)){
                  return;
                }
                hashes.push(row);
              });
            }
          } finally {
            client.release();
          }
        }));
        commandClasses.forEach((commandClass, i) => {
          hashes
            .filter(({name}) => commandClass === name)
            .map(({hash}) => cordappHashMap[hash])
            .filter(file => file != null)
            .forEach(file => {
              wire.commands[i].contractFile = file;
            });
        });
      }
      return wire;
    }
    return [];
  }

  async update(nodes, port, canceller = {cancelled: false}) {
    const txhash = this.txhash;
    const transaction = this;
    const knownStateObservers = new Map();
    const resultPromises = nodes.map(async node => {
      // first, get all indexes from each node for each transaction...
      const indexes = await queryForTxHashIndexes(txhash, node, port, canceller);
      if (canceller.cancelled) return;
      
      // if we don't have any we just skip this node
      if (indexes.length === 0) return;

      // since we can see at least 1 state in the transaction add it to the
      // transactions observer list
      transaction.observers.add(node);

      // A bit a of a race between nodes here... which ever node gets here first
      // will be the node that queries for the state at the given tx `index`
      const nodeQueries = [];
      indexes.forEach(index => {
        if (knownStateObservers.has(index)) {
          // This index was already claimed by another node, so add ourselves
          // to the list of state-specific observers
          const map = knownStateObservers.get(index);
          map.add(node);
        } else {
          // we're the first to see this node, so put it in our query list and
          // add ourselves to the list of state-specific observers
          knownStateObservers.set(index, new Set([node]));
          nodeQueries.push({txhash, index});
        }
      });

      // if we didn't find (or "win") any queries we're done with this node
      if (nodeQueries.length === 0) return;

      // query the node's braid server for the states it has "claimed"
      const res = await fetch("https://localhost:" + (node.braidPort) + "/api/rest/vault/vaultQueryBy", {
        method: "POST",
        headers: {
          "accept": "application/json"
        },
        body: JSON.stringify({
          "criteria" : {
            "@class" : ".QueryCriteria$VaultQueryCriteria",
            "status" : "ALL",
            "stateRefs" : nodeQueries,
            // TODO: add pagination...
          }
        })
      });
      if (canceller.cancelled) return;

      const json = await res.json();
      if (canceller.cancelled) return;
      
      Array.isArray(json.states) && json.states.forEach((state, i) => {
        const index = state.ref.index;
        const metaData = json.statesMetadata[i];

        // we need to give the transaction a time, which is not an
        // exact-science in corda as each state has its own time. Actually,
        // each node has its own time, but we aren't currently goint to
        // reconcile competing node+index differences.
        const earliestRecordedTime = new Date(metaData.recordedTime);
        const curRecordedTime = transaction.earliestRecordedTime;
        if (!curRecordedTime || earliestRecordedTime < curRecordedTime) {
          transaction.earliestRecordedTime = earliestRecordedTime;
        }

        // Keep the state specific observers list around
        state.observers = knownStateObservers.get(index);

        // store the metaData on the state itself to make iterating over
        // states easier
        state.metaData = metaData;

        const notary = state.state.notary;
        if (notary) {
          transaction.notaries.add(notary.owningKey);
        }

        // and keep the state around on the transaction
        transaction.states.set(index, state);
      });
    });

    // wait for everything before we render, otherwise we risk a janky
    // render as results come in from all the nodes and indexes
    await Promise.all(resultPromises);

    return transaction;
  }

  static getAllTransactions = getAllTransactions
}
