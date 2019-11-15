const { spawn } = require("child_process");

// java -jar braid-server.jar localhost:10007 user1 letmein 8000 3 ./corda/party1/cordapps/

let port = 20000; // TODO: change this

class Braid {
  constructor(braid_home){
    this.BRAID_HOME = braid_home;
    this.servers = new Map();
  }

  start(entity, path, config){
    const name = entity.safeName;
    const exists = this.servers.get(name);
    if(!exists) {
      const currentConfig = Object.assign({ cwd : this.BRAID_HOME }, config);
      const braid = spawn("java", ["-jar", "braid-server.jar", `localhost:${entity.rpcPort}`, "user1", "letmein", port++, 3, `${path}/cordapps/`], currentConfig);

      braid.stderr.on('data', (data) => {
        console.error(`stderr:\n${data}`);
      });

      braid.on("error", console.error);

      this.servers.set(name, {path, braid});

      return new Promise((resolve, reject) => {
        braid.once('close', (code) => {
          // TODO: handle premature individual node shutdown
          /// close postgres, close other nodes, what do?
          console.log(`child process exited with code ${code}`);
          reject();
        });

        braid.stdout.on('data', (data) => {
          console.log(`${data}`);
          if (data.toString().includes(" - Braid server started successfully on ")) {
            resolve();
          }
        });
      });
    }
    return exists;
  }

  getBraidHome(){
    return this.BRAID_HOME;
  }

  getAll(){
    console.log(this.servers);
  }

  shutdown(){
    console.log("shutdown");
  }
}

module.exports = Braid;
