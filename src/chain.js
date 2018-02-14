#!/usr/bin/env node

var ganacheLib = require("ganache-cli")
var path = require("path")

// remove the uncaughtException listener added by ganache-cli
process.removeAllListeners('uncaughtException')

if (!process.send) {
  throw new Error("Must be run as a child process!")
}

var server;
var provider;
var blockInterval;
var lastBlock;

function stopServer(callback) {
  callback = callback || function() {}

  clearInterval(blockInterval)

  if (server) {
    server.close(callback)
  } else {
    process.send({type: "server-stopped"})
    callback()
  }
}

function startServer(options) {
  stopServer(function() {
    console.log("Starting server with configuration: " + JSON.stringify(options))

    // The TestRPC's logging system is archaic. We'd like more control
    // over what's logged. For now, the really important stuff all has
    // a space on the front of it. So let's only log the stuff with a
    // space on the front. ¯\_(ツ)_/¯
    options.logger = {
      log: (message) => {
        if (typeof message === 'string' && message.indexOf(" ") == 0) {
          console.log(message)
        }
      }
    }

    server = ganacheLib.server(options);

    // We'll also log all methods that aren't marked internal by Ganache
    var oldSend = server.provider.send.bind(server.provider)
    server.provider.send = function(payload, callback) {
      if (payload.internal !== true) {
        if (Array.isArray(payload)) {
          payload.forEach(function(item) {
            console.log(item.method)
          })
        } else {
          console.log(payload.method)
        }
      }

      oldSend(payload, callback)
    }

    server.listen(options.port, options.hostname, function(err, result) {
      if (err) {
        process.send({type: 'start-error', data: err});
        return
      }

      var state = result ? result : server.provider.manager.state;

      if (!state) {
        process.send({type: 'start-error', data: "Couldn't get a reference to TestRPC's StateManager."});
        return
      }

      var data = {
        mnemonic: state.mnemonic,
        hdPath: state.wallet_hdpath,
        privateKeys: {}
      }

      var accounts = state.accounts;
      var addresses = Object.keys(accounts);

      addresses.forEach(function(address, index) {
        data.privateKeys[address] = accounts[address].secretKey.toString("hex")
      });

      process.send({type: 'server-started', data: data})

      console.log("Ganache started successfully!")
      console.log("Waiting for requests...")
    })

    server.on("close", function() {
      process.send({type: "server-stopped"})
    })
  })
}

process.on("message", function(message) {
  //console.log("CHILD RECEIVED", message)
  switch(message.type) {
    case "start-server":
      startServer(message.data)
      break;
    case "stop-server":
      stopServer()
      break;
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

process.on('unhandledRejection', (err) => {		
  //console.log('unhandled rejection:', err.stack || err)		
  process.send({type: 'error', data: copyErrorFields(err)})		
});

process.on('uncaughtException', (err) => {		
  //console.log('uncaught exception:', err.stack || err)		
  process.send({type: 'error', data: copyErrorFields(err)})		
});

process.send({type: 'process-started'})

// If you want to test out an error being thrown here
// setTimeout(function() {
//   throw new Error("Error from chain process!")
// }, 4000)
