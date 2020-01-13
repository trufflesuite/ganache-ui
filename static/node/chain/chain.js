#!/usr/bin/env node

//var ganacheLib = require("../../../../ganache-core"); // for easy testing
const ganacheLib = require("ganache-core");
const logging = require("./logging");

if (!process.send) {
  console.log("Not running as child process. Throwing.");
  throw new Error("Must be run as a child process!");
}

// remove the uncaughtException listener added by ganache-cli
process.removeAllListeners("uncaughtException");

process.on("unhandledRejection", err => {
  //console.log('unhandled rejection:', err.stack || err)
  process.send({ type: "error", data: copyErrorFields(err) });
});

process.on("uncaughtException", err => {
  //console.log('uncaught exception:', err.stack || err)
  process.send({ type: "error", data: copyErrorFields(err) });
});

let server;
let blockInterval;
let dbLocation;

async function stopServer() {
  clearInterval(blockInterval);

  if (server) {
    return new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    })
  } else {
    process.send({ type: "server-stopped" });
  }
}

async function startServer(options) {
  await stopServer();
  
  let sanitizedOptions = Object.assign({}, options);
  delete sanitizedOptions.mnemonic;

  const logToFile =
    options.logDirectory !== null && typeof options.logDirectory === "string";

  if (typeof options.logger === "undefined") {
    if (logToFile) {
      logging.generateLogFilePath(options.logDirectory);

      options.logger = {
        log: message => {
          if (typeof message === "string") {
            logging.logToFile(message);
          }
        },
      };
    } else {
      // The TestRPC's logging system is archaic. We'd like more control
      // over what's logged. For now, the really important stuff all has
      // a space on the front of it. So let's only log the stuff with a
      // space on the front. ¯\_(ツ)_/¯

      options.logger = {
        log: message => {
          if (
            typeof message === "string" &&
            (options.verbose || message.indexOf(" ") == 0)
          ) {
            console.log(message);
          }
        },
      };
    }
  }

  // log startup options without logging user's mnemonic
  const startingMessage = `Starting server with initial configuration: ${JSON.stringify(sanitizedOptions)}`;
  console.log(startingMessage);
  if (logToFile) {
    logging.logToFile(startingMessage);
  }

  server = ganacheLib.server(options);

  // We'll also log all methods that aren't marked internal by Ganache
  var oldSend = server.provider.send.bind(server.provider);
  server.provider.send = (payload, callback) => {
    if (payload.internal !== true) {
      if (Array.isArray(payload)) {
        payload.forEach(function(item) {
          console.log(item.method);
        });
      } else {
        console.log(payload.method);
      }
    }

    oldSend(payload, callback);
  };

  server.listen(options.port, options.hostname, (err, result) => {
    if (err) {
      process.send({ type: "start-error", data: {code: err.code, stack: err.stack, message: err.message} });
      return;
    }

    const state = result ? result : server.provider.manager.state;
    dbLocation = state.blockchain.data.directory;

    if (!state) {
      process.send({
        type: "start-error",
        data: "Couldn't get a reference to TestRPC's StateManager.",
      });
      return;
    }

    const privateKeys = {};

    const accounts = state.accounts;
    const addresses = Object.keys(accounts);

    addresses.forEach((address) => {
      privateKeys[address] = accounts[address].secretKey.toString("hex");
    });

    const data = Object.assign({}, server.provider.options);

    // delete anything which might've been in the ganache-core options object
    // that we don't want to pass on to the main process
    delete data.logger;
    delete data.vm;
    delete data.state;
    delete data.trie;

    // ensure certain fields are present for backward compatibility with old
    // versions of ganache-core
    data.hdPath = data.hdPath || state.wallet_hdpath;
    data.mnemonic = data.mnemonic || state.mnemonic;
    data.privateKeys = privateKeys;

    process.send({ type: "server-started", data: data });

    console.log("Ganache started successfully!");
    console.log("Waiting for requests...");
  });

  server.on("close", () => {
    server = null;
    process.send({ type: "server-stopped" });
  });
}

function getDbLocation() {
  process.send({ type: "db-location", data: dbLocation || null });
}

process.on("message", (message) => {
  //console.log("CHILD RECEIVED", message)
  switch (message.type) {
    case "start-server":
      startServer(message.data);
      break;
    case "stop-server":
      stopServer();
      break;
    case "get-db-location":
      getDbLocation();
      break;
  }
});

function copyErrorFields(e) {
  let err = Object.assign({}, e);

  // I think these properties aren't enumerable on Error objects, so we copy
  // them manually if we don't do this, they aren't passed via IPC back to the
  // main process
  err.message = e.message;
  err.stack = e.stack;
  err.name = e.name;

  return err;
}

process.send({ type: "process-started" });
