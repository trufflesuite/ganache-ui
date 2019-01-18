import * as Transactions from "./actions";

const initialState = {
  inView: [],
  blocksRequested: {},
  receipts: {},
  currentTransaction: null,
  currentTransactionReceipt: null,
  currentTransactionEvents: [],
  currentTransactionContract: null,
  loading: false,
};

// Note: This sorts in reverse; higher blocks first
function sort(txs) {
  return txs.sort(function(a, b) {
    if (a.blockNumber > b.blockNumber) {
      return -1;
    }
    if (a.blockNumber < b.blockNumber) {
      return 1;
    }
    // blockNumbers must be equal
    // Let's sort by transaction index
    if (a.transactionIndex > b.transactionIndex) {
      return -1;
    }
    if (b.transactionIndex < b.transactionIndex) {
      return 1;
    }
    return 0;
  });
}

export default function(state = initialState, action) {
  switch (action.type) {
    case Transactions.CLEAR_TRANSACTIONS_IN_VIEW:
      return Object.assign({}, state, {
        inView: [],
        blocksRequested: {},
        receipts: {},
      });
    case Transactions.SET_BLOCK_REQUESTED:
      var blocksRequested = Object.assign({}, state.blocksRequested, {
        [action.number]: true,
      });
      return Object.assign({}, state, {
        blocksRequested,
      });
    case Transactions.ADD_RECEIPTS:
      let receipts = Object.assign({}, state.receipts);

      action.receipts.forEach(receipt => {
        receipts[receipt.transactionHash] = receipt;
      });

      return Object.assign({}, state, {
        receipts,
      });
    case Transactions.ADD_TRANSACTIONS_TO_VIEW:
      let inView = state.inView.concat(action.transactions);

      return Object.assign({}, state, {
        inView: sort(inView),
      });
    case Transactions.SET_CURRENT_TRANSACTION_SHOWN:
      return Object.assign({}, state, {
        currentTransaction: action.transaction,
        currentTransactionReceipt: action.receipt,
        currentTransactionEvents: action.events,
        currentTransactionData: action.decodedData,
        currentTransactionContract: action.contract,
      });
    case Transactions.SET_LOADING:
      return Object.assign({}, state, { loading: action.loading });
      break;
    default:
      return state;
  }
}
