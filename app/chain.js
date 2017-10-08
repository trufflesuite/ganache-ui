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
    server = TestRPC.server(options);
  
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
    })
  })
}

function sendHeartBeat() {
  process.send({type: 'heartbeat'})
}

process.on("message", function(message) {
  console.log("CHAIN RECEIVED: " + JSON.stringify(message))
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