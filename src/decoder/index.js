const getProjectDetails = require("./projectDetails").get;
const ProjectWatcher = require("./projectWatcher");

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

process.on("message", function(message) {
  switch(message.type) {
    case "web3-provider":
      watcher.setWeb3(message.data);
      break;
    case "project-details-request":
      const response = getProjectDetails(message.data);

      process.send({
        type: "project-details-response",
        data: response
      });

      if (typeof response === "object") {
        watcher.add(response);
      }
      break;
    case "project-unwatch":
      watcher.remove(message.data);
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

process.send({type: "process-started"});
