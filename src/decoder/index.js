const getProjectDetails = require("./projectDetails").get;

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

process.on("message", function(message) {
  switch(message.type) {
    case "project-details-request":
      const response = getProjectDetails(message.data);
      process.send({
        type: "project-details-response",
        data: response
      });
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
