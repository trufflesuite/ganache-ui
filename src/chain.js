#!/usr/bin/env node
var GanacheServer = require("ganache-core/lib/server")
var path = require("path")
var Web3 = require("web3")

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
        if (message && message.indexOf(" ") == 0) {
          console.log(message)
        }
      }
    }

    server = GanacheServer.create(options);

    // We'll also log all methods that aren't marked internal by Ganache
    var oldSendAsync = server.provider.sendAsync.bind(server.provider)
    server.provider.sendAsync = function(payload, callback) {
      if (payload.internal !== true) {
        if (Array.isArray(payload)) {
          payload.forEach(function(item) {
            console.log(item.method)
          })
        } else {
          console.log(payload.method)
        }
      }

      oldSendAsync(payload, callback)
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

      // Perform block polling within the chain, emitting a block event
      // when a new block occurs.
      lastBlock = -1;
      provider = new Web3.providers.HttpProvider("http://" + options.hostname + ":" + options.port)

      var web3 = new Web3()

      blockInterval = setInterval(function() {
        provider.sendAsync({
          jsonrpc: "2.0",
          method: "eth_blockNumber",
          params: [],
          id: new Date().getTime(),
          internal: true // Important for ganache requests so they're not logged
        }, function(err, response) {
          if (err || !response) {
            console.log("Block polling error: ", err.stack)
            return
          }

          var blockNumber = web3.toDecimal(response.result)
          if (blockNumber > lastBlock) {
            lastBlock = blockNumber
            process.send({type: "block", data: blockNumber})
          }
        })
      }, 500)
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

process.on('uncaughtException', (err) => {		
  console.log(err.stack || err)		
  process.send({type: 'error', data: err.stack || err})		
});

process.send({type: 'process-started'})

// If you want to test out an error being thrown here
// setTimeout(function() {
//   throw new Error("Error from chain process!")
// }, 4000)
