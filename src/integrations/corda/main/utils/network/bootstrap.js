const {generate, templates} = require("../config");
const { createWriteStream, appendFileSync } = require("fs");
const { dirname, join } = require("path");
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
    this.handleClose = this.handleClose.bind(this);
  }

  async writeConfig(nodes, notaries, postgresPort, POSTGRES_DRIVER) {
    const nodesArr = this.nodes = [];
    const notariesArr = this.notaries = [];
    
    const modifier = {
      postgres: {
        schema: undefined,
        port: postgresPort
      }
    }
    
    const writer = async (arr, out, template) => {
      for (let i = 0; i < arr.length; i++) {
        const current = arr[i];
        const name = `${current.safeName}`;
        out.push(current);
        const path = join(this.workspaceDirectory, `${name}_node.conf`)
        const stream = createWriteStream(path);
        const write = (val) => stream.write(`${val}\n`, "utf8");
        const mod = produceModifier(modifier, { write }, current);
        mod.postgres.schema = current.safeName;
        generate(template, mod);
        // eslint-disable-next-line no-console
        const close = waitForClose(stream).catch(console.log);
        stream.end();

        // I can't figure out how to use this config generator to save my life.
        // I'm just going to write what I want to the file here:
        await close;
        appendFileSync(path, `jarDirs=["${dirname(POSTGRES_DRIVER)}"]`);
      }
    }

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
    this.JAVA_HOME = JAVA_HOME;
    this._io.sendProgress("Loading Corda Network Bootstrapper...");
    this.CORDA_BOOTSTRAPPER = await config.corda.files.cordaBoostrapper.download();
    // java on the PATH is required for bootstrapper
    this.spawnConfig = {env: {PATH: join(JAVA_HOME, "bin"), CAPSULE_CACHE_DIR: "./capsule"}, cwd: this.workspaceDirectory};
    this._io.sendProgress("Running Corda Network Bootstrapper...");
    const java = spawn("java", ["-jar", this.CORDA_BOOTSTRAPPER, "--dir", this.workspaceDirectory, "--minimum-platform-version", "1"], this.spawnConfig);

    this.stderr = "";
    java.stderr.on('data', (data) => {
      const strData = data.toString();
      if (strData.includes("CAPSULE EXCEPTION: Capsule not extracted.")){
        java.off('close', this.handleClose);
        const {resolve, reject} = this.awaiter;
        this.bootstrap(config).then(resolve).catch(reject);
      }
      this.stderr += strData;
      this._io.sendStdErr(data);
      // this.emit("message", "stderr", data, this.entity.safeName);
      // eslint-disable-next-line no-console
      console.error(`stderr:\n${data}`);
    });

    this.stdout = "";
    java.stdout.on('data', (data) => {
      this.stdout += data.toString();
      this._io.sendStdOut(data);
      // this.emit("message", "stdout", data, this.entity.safeName);
      // eslint-disable-next-line no-console
      console.log(`stdout:\n${data}`);
    });

    this.err = "";
    this.awaiter = {resolve:()=>{}, reject:()=>{}};
    return new Promise((resolve, reject) => {
      this.awaiter = {resolve, reject};
      java.on('error', (error) => {
        this.err += error.toString();
        // eslint-disable-next-line no-console
        console.error(error);
        this._io.sendError(new Error(error.toString()))
      });

      java.on('close', this.handleClose);
    });
  }
  handleClose (code) {
    // eslint-disable-next-line no-console
    console.error(`${this.CORDA_BOOTSTRAPPER} (${this.workspaceDirectory}): child process exited with code ${code} (JAVA_HOME: ${this.JAVA_HOME})`);
    if (code === 0) {
      this.awaiter.resolve();
    } else {
      this.awaiter.reject(new Error(`corda bootstrapper child process exited with code ${code}.\n\nStderr:\n${this.stderr}\n\nStdout:\n${this.stdout}\n\nError:\n${this.err}\n\nconfig:${JSON.stringify(this.spawnConfig)}`));
    }
  }
}

module.exports = {
  CordaBootstrap
}
