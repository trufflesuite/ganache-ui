const getProjectDetails = require("./projectDetails").get;
const ProjectWatcher = require("./projectWatcher");
const DecodeHelpers = require("./decode");

let web3Host;

watcher = new ProjectWatcher();

if (!process.send) {
  console.log("Not running as child process. Throwing.");
  throw new Error("Must be run as a child process!");
}

process.removeAllListeners("uncaughtException");

process.on("unhandledRejection", (err) => {
  process.send({type: "error", data: copyErrorFields(err)});
});

process.on("uncaughtException", (err) => {
  process.send({type: "error", data: copyErrorFields(err)});
});

// Subscribe and forward watcher events
const watcherEvents = [
  "contract-deployed",
  "contract-transaction",
  "contract-event"
];
watcherEvents.forEach((eventName) => {
  watcher.on(eventName, (data) => {
    process.send({
      type: eventName,
      data: data
    });
  });
});

process.on("message", async function(message) {
  switch(message.type) {
    case "web3-provider": {
      web3Host = message.data;
      watcher.setWeb3(web3Host);
      break;
    }
    case "project-details-request": {
      const response = getProjectDetails(message.data);

      process.send({
        type: "project-details-response",
        data: response
      });

      if (typeof response === "object") {
        watcher.add(response);
      }
      break;
    }
    case "project-unwatch": {
      watcher.remove(message.data);
      break;
    }
    case "transaction-decode-request": {
      break;
    }
    case "decode-contract-request": {
      const { contract, contracts, block } = message.data;
      let state = web3Host ? await DecodeHelpers.getContractState(contract, contracts, web3Host, block) : {};
      state = state.variables;
      process.send({
        type: "decode-contract-response",
        data: state
      });
      break;
    }
    case "decode-event-request": {
      const { contract, contracts, log } = message.data;
      let decodedLog = web3Host ? await DecodeHelpers.getDecodedEvent(contract, contracts, web3Host, log) : {};
      process.send({
        type: "decode-event-response",
        data: decodedLog
      });
      break;
    }
    case "decode-transaction-request": {
      const { contract, contracts, transaction } = message.data;
      let decodedData = web3Host ? await DecodeHelpers.getDecodedTransaction(contract, contracts, web3Host, transaction) : {};
      process.send({
        type: "decode-transaction-response",
        data: decodedData
      });
      break;
    }
  }
});

function copyErrorFields(e) {
  let err = Object.assign({}, e)

  // I think these properties aren't enumerable on Error objects, so we copy
  // them manually if we don't do this, they aren't passed via IPC back to the
  // main process
  err.message = e.message
  err.stack = e.stack
  err.name = e.name

  return err
}

process.send({type: "process-started"});
