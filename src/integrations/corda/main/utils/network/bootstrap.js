const {generate, templates} = require("../config");
const port = require("./port");
const { createWriteStream } = require("fs");
const { join } = require("path");
const { spawn } = require('child_process');

function waitForEvent( stream, event ){
    return new Promise( resolve  => {
        stream.on( event, resolve );
    });
}

function waitForClose( stream ){
    return waitForEvent(stream, "close");
}

const produceModifier = (...args) => {
  return Object.assign({}, ...args);
}

const writeConfig = async (workspaceDirectory,  nodes, notaries, startPort) => {
  const nodesArr = [];
  const notariesArr = [];
  
  const getPort = port(startPort);

  const modifier = {
    getPort,
    postgres: {
      port: 15433,
      schema: undefined
    }
  }

  for (let i = 0; i < notaries.length; i++) {
    const current = notaries[i];
    const name = `${current.safeName}`;
    notariesArr.push(current);
    const stream = createWriteStream(join(workspaceDirectory, `${name}_node.conf`));
    const write = (val) => stream.write(`${val}\n`, "utf8");
    const mod = produceModifier(modifier, { write }, current);
    mod.postgres.schema = current.safeName;
    mod.postgres.port = current.dbPort;
    generate(templates.notary, mod);
    const close = waitForClose(stream).catch(console.log);
    stream.end();
    await close;
  }
  
  for (let i = 0; i < nodes.length; i++) {
    const current = nodes[i];
    const name = `${current.safeName}`;
    nodesArr.push(current);
    const stream = createWriteStream(join(workspaceDirectory, `${name}_node.conf`));
    const write = (val) => stream.write(`${val}\n`, "utf8");
    const mod = produceModifier(modifier, { write }, current);
    mod.postgres.schema = current.safeName;
    mod.postgres.port = current.dbPort;
    generate(templates.node, mod);
    const close = waitForClose(stream).catch(console.log);
    stream.end();
    await close;
  }
  return {
    nodesArr,
    notariesArr
  }
}

const bootstrap = async (workspaceDirectory, config) => {
  const JAVA_HOME = await config.corda.files.jre.download();
  const CORDA_BOOTSTRAPPER = await config.corda.files.cordaBoostrapper.download();
  // java on the PATH is required for bootstrapper
  const spawnConfig = {env: {PATH: join(JAVA_HOME, "bin")}};
  const java = spawn("java", ["-jar", CORDA_BOOTSTRAPPER, "--dir", workspaceDirectory], spawnConfig);

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

module.exports = {
  writeConfig,
  bootstrap
}
