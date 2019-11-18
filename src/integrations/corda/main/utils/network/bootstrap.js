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
  constructor(workspaceDirectory){
    this.workspaceDirectory = workspaceDirectory;
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

    await writer(notaries, notariesArr, templates.notary);
    await writer(nodes, nodesArr, templates.node);
  
    return {
      nodesArr,
      notariesArr
    }
  }

  async bootstrap(config) {
    const JAVA_HOME = await config.corda.files.jre.download();
    const CORDA_BOOTSTRAPPER = await config.corda.files.cordaBoostrapper.download();
    // java on the PATH is required for bootstrapper
    const spawnConfig = {env: {PATH: join(JAVA_HOME, "bin")}};
    const java = spawn("java", ["-jar", CORDA_BOOTSTRAPPER, "--dir", this.workspaceDirectory], spawnConfig);

    java.stdout.on('data', (data) => {
      console.log(`${data}`);
    });

    java.stderr.on('data', (data) => {
      console.error(`stderr:\n${data}`);
    });

    return new Promise((resolve, reject) => {
      java.on('error', (err) => {
        console.error(err);
      });

      java.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        if (code === 0) {
          resolve();
        } else {
          reject(code);
        }
      });
    });
  }
}

module.exports = {
  CordaBootstrap
}
