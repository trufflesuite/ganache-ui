#!/usr/bin/env node

var TestRPC = require("ethereumjs-testrpc");
var path = require("path");

if (!process.send) {
  throw new Error("Must be run as a child process!")
}

var server;

function stopServer(callback) {
  if (server) {
    server.close(function() {
      process.send({type: 'server-stopped'})
      process.send()
      server = null;
      callback();
    })
  } else {
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

    server = TestRPC.server(options);

    // We'll log all methods that aren't marked internal by Ganache
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
  
    server.listen(options.port, options.hostname, function(err) {
      if (err) {
        process.send({type: 'start-error', data: err});
        return
      }
      
      // Little deep; smelly
      var stateManager = server.provider.manager.state

      process.send({type: 'server-started', data: {
        mnemonic: stateManager.mnemonic,
        hdPath: stateManager.wallet_hdpath
      }})

      console.log("Ganache started successfully!")
      console.log("Waiting for requests...")
    })
  })
}

function sendHeartBeat() {
  process.send({type: 'heartbeat'})
}

process.on("message", function(message) {
  switch(message.type) {
    case "start-server": 
      startServer(message.data)
      break;
    case "stop-server":
      stopServer()
  }
});

sendHeartBeat()

// Keep an interval going so the process stays open.
// We can use this interval to maintain a heartbeat
setInterval(function() {
  sendHeartBeat()
}, 500);