const { spawn } = require("child_process");
const { join } = require("path");

class Braid {
  constructor(braid_home, io){
    this.BRAID_HOME = braid_home;
    this.servers = new Map();
    this._io = io;
  }

  start(entity, path, JAVA_HOME){
    const name = entity.safeName;
    const exists = this.servers.get(name);
    if (!exists) {
      const args = ["-jar", "braid-server.jar", `localhost:${entity.rpcPort}`, "user1", "letmein", entity.braidPort, 3, ...(entity.cordapps || [])];
      // figure out which partsof teh env are actually needed...
      const copyEnv = ["APPDATA", "COMSPEC", "HOME", "HOMEDRIVE", "HOMEPATH", "LANG", "LOCALAPPDATA", "OS", "ProgramData", "TEMP", "TMP", "WINDIR"];
      const env = copyEnv.reduce((env, name) => (env[name] = process.env[name], env), {});
      env.JAVA_TOOL_OPTIONS = "-Dfile.encoding=UTF8";
      const braid = spawn(join(JAVA_HOME, "bin", "java"), args, { cwd : this.BRAID_HOME, env });

      braid.stderr.on("data", (error) => {
        console.error(`stderr:\n${error}`);
      });

      braid.on("error", (error) => {
        console.error(`error:\n${error}`);
        this._io.sendError(new Error(error.toString()));
      });
      braid.once("close", (code) => {
        console.log("braid", `child process exited with code ${code}`);
      });

      this.servers.set(name, {path, braid});

      return new Promise((resolve, reject) => {
        const close = (code) => {
          // TODO: handle premature individual node shutdown
          /// close postgres, close other nodes, what do?
          reject(new Error(`braid-server.jar child process exited with code ${code}`));
        }
        braid.once("close", close);

        braid.stdout.on("data", (data) => {
          console.log(`${data}`);
          if (data.toString().includes(" - Braid server started successfully on ")) {
            braid.removeListener("close", close);
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
          if (!braid.killed) {
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
