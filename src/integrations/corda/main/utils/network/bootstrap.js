const {generate, templates} = require("../config");
const { createWriteStream } = require("fs");
const { join } = require("path");
const { spawn } = require('child_process');

const waitForEvent = ( stream, event ) => new Promise( resolve  => {
  stream.on( event, resolve );
});

const waitForClose = ( stream ) => waitForEvent(stream, "close");

const produceModifier = (...args) => Object.assign({}, ...args);


class CordaBootstrap {
  constructor(workspaceDirectory, io){
    this.workspaceDirectory = workspaceDirectory;
    this._io = io;
  }

  async writeConfig(nodes, notaries) {
    const nodesArr = this.nodes = [];
    const notariesArr = this.notaries = [];
    
    const modifier = {
      postgres: {
        port: 15433,
        schema: undefined
      }
    }
    
    const writer = async (arr, out, template) => {
      for (let i = 0; i < arr.length; i++) {
        const current = arr[i];
        const name = `${current.safeName}`;
        out.push(current);
        const stream = createWriteStream(join(this.workspaceDirectory, `${name}_node.conf`));
        const write = (val) => stream.write(`${val}\n`, "utf8");
        const mod = produceModifier(modifier, { write }, current);
        mod.postgres.schema = current.safeName;
        mod.postgres.port = current.dbPort;
        generate(template, mod);
        const close = waitForClose(stream).catch(console.log);
        stream.end();
        await close;
      }
    }

    this._io.sendProgress("Writing configuration files..");
    await writer(notaries, notariesArr, templates.notary);
    await writer(nodes, nodesArr, templates.node);
  
    return {
      nodesArr,
      notariesArr
    }
  }

  async bootstrap(config) {
    this._io.sendProgress("Loading JRE...");
    const JAVA_HOME = await config.corda.files.jre.download();
    this._io.sendProgress("Loading Corda Network Bootstrapper...");
    const CORDA_BOOTSTRAPPER = await config.corda.files.cordaBoostrapper.download();
    // java on the PATH is required for bootstrapper
    const spawnConfig = {env: {PATH: join(JAVA_HOME, "bin"), CAPSULE_CACHE_DIR: "./capsule"}};
    this._io.sendProgress("Starting Corda Network Bootstrapper...");
    const java = spawn("java", ["-jar", CORDA_BOOTSTRAPPER, "--dir", this.workspaceDirectory], spawnConfig);

    java.stderr.on('data', (data) => {
      this._io.sendStdErr(data);
      // this.emit("message", "stderr", data, this.entity.safeName);
      console.error(`stderr:\n${data}`);
    });

    java.stdout.on('data', (data) => {
      this._io.sendStdOut(data);
      // this.emit("message", "stdout", data, this.entity.safeName);
      console.log(`stdout:\n${data}`);
    });

    return new Promise((resolve, reject) => {
      java.on('error', (error) => {
        console.error(error);
        this._io.sendError(new Error(error.toString()))
      });

      java.on('close', (code) => {
        console.error(`${CORDA_BOOTSTRAPPER} (${this.workspaceDirectory}): child process exited with code ${code} (JAVA_HOME: ${JAVA_HOME})`);
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`child process exited with code ${code}`));
        }
      });
    });
  }
}

module.exports = {
  CordaBootstrap
}
