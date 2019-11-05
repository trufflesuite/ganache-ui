const pg = require("./postgres")();
const nodeNames = ["hello", "world"];
const fileSystemSafeWorkspaceName = "testing";
const postgresPort = 15432;
// pg.start is syncronous
const start = pg.start(postgresPort, fileSystemSafeWorkspaceName, nodeNames);


// for manually testing things we just wait until the user presses a key
const readline = require("readline");
(async function(){
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  await new Promise(resolve => rl.question("Press any key to shutdown", () => {
    rl.close();
    resolve();
  }))
})();

// stop the postgres process completely
start.stop();
