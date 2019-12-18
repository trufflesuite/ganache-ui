import bs58 from "bs58";
import { Client } from "pg";
import { Buffer } from "safe-buffer";

function convertTxHashToId(txhash) {
  return bs58.decode(txhash).toString("hex").toUpperCase();
}
function convertTransactionIdToHash(transactionId) {
  const bytes = Buffer.from(transactionId, "hex");
  return bs58.encode(bytes);
}
function getClient(database, port) {
  return new Client({
    user: "postgres",
    host: "localhost",
    password: "",
    database,
    port
  });
}
async function getConnectedClient(database, port) {
  const client = getClient(database, port);
  await client.connect();
  return client;
}
async function queryForTxHashIndexes(txhash, node, port, canceller) {
  let res;
  const txId = convertTxHashToId(txhash);
  const client =  await getConnectedClient(node.safeName, port);
  try {
    if (canceller.cancelled) return;

    res = await client.query(`SELECT output_index FROM vault_states WHERE transaction_id = $1::text`, [txId]);
  } finally {
    client.end();
  }
  return res.rows.map(r => r.output_index);
}

async function getAllTransactions(nodes, allNodes, port, canceller = {cancelled: false}) {
  const transactions = new Map();
  await Promise.all(nodes.map(async node => {
    const client = await getConnectedClient(node.safeName, port, canceller);
    if (canceller.cancelled) { client.end(); return; }
    let res;
    try {   
      // get all transactions this client knows about
      res = await client.query(`SELECT distinct(transaction_id) transaction_id FROM vault_states GROUP BY transaction_id`);
    } finally {
      client.end();
    }
    if (canceller.cancelled) { return; }

    // iterate over all the found transactions, and make sure they are completely filled in from states from all
    // nodes
    await Promise.all(res.rows.map(row => {
      const tx = new TransactionData(convertTransactionIdToHash(row.transaction_id));
      if (transactions.has()) return;

      transactions.set(tx.txhash, tx);
      return tx.update(allNodes, port, canceller);
    }));
  }));
  return [...transactions.values()];
}

export default class TransactionData {
  constructor(txhash) {
    this.txhash = txhash;
    this.states = new Map();
    this.earliestRecordedTime = undefined;
    this.observers = new Set();
    this.notaries = new Set();
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
      const res = await fetch("https://localhost:" + (node.rpcPort + 10000) + "/api/rest/vault/vaultQueryBy", {
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
      
      json.states.forEach((state, i) => {
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