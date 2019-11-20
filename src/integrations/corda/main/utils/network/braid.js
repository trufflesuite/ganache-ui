const { spawn } = require("child_process");
const { join } = require("path");

// java -jar braid-server.jar localhost:10007 user1 letmein 8000 3 ./corda/party1/cordapps/

class Braid {
  constructor(braid_home){
    this.BRAID_HOME = braid_home;
    this.servers = new Map();
  }

  start(entity, path, JAVA_HOME){
    const name = entity.safeName;
    const exists = this.servers.get(name);
    if (!exists) {
      const args = ["-jar", "braid-server.jar", `localhost:${entity.rpcPort}`, "user1", "letmein", entity.rpcPort + 10000, 3, ...entity.cordapps];
      // current env PATH seems to be required for braid to actually work
      const braid = spawn(join(JAVA_HOME, "bin", "java"), args, { cwd : this.BRAID_HOME, env: { PATH: process.env.PATH } });

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
    return this.servers;
  }

  stop(){
    const promises = [];
    this.servers.forEach((server, key) => {
      promises.push(new Promise(resolve => {
        const braid = server.braid;
        if (braid) {
          braid.once("close", ()=> {
            server.braid = null;
            this.servers.delete(key);
            resolve();
          });
          if(!braid.killed) {
            braid.kill();      
          }
        } else {
          this.servers.delete(key);
          resolve();
        }
      }));
    });
    return Promise.all(promises);
  }
}

module.exports = Braid;
