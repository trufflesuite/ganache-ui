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
  const getNonce = ((val) => () => val++)(0);

  const modifier = {
    getPort,
    getNonce,
    postgres: {
      port: 15433,
      schema: undefined
    }
  }

  for (let i = 0; i < notaries.length; i++) {
    const name = `notary${i}`;
    nodesArr.push(name);
    const stream = createWriteStream(join(workspaceDirectory, `${name}_node.conf`));
    const write = (val) => stream.write(`${val}\n`, "utf8");
    const mod = produceModifier(modifier, { write });
    mod.postgres.schema = name;
    generate(templates.notary, mod);
    const close = waitForClose(stream).catch(console.log);
    stream.end();
    await close;
  }

  for (let i = 0; i < nodes.length; i++) {
    const name = `party${i}`;
    notariesArr.push(name);
    const stream = createWriteStream(join(workspaceDirectory, `${name}_node.conf`));
    const close = waitForClose(stream).catch(console.log);
    const write = (val) => stream.write(`${val}\n`, "utf8");
    const mod = produceModifier(modifier, { write });
    mod.postgres.schema = name;
    generate(templates.node, mod);
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
  const java = spawn("java", ["-jar", CORDA_BOOTSTRAPPER, "--dir", workspaceDirectory], {
    env : {
      PATH : `${JAVA_HOME}/bin:$PATH`
    }
  });

  java.stdout.on('data', (data) => {
    console.log(`${data}`);
  });

  java.stderr.on('data', (data) => {
    console.error(`stderr:\n${data}`);
  });

  return new Promise((resolve, reject) => {
    java.on('error', (err) => {
      console.error(err);
      // TODO: if we reject here, we'll also then `resolve` in the close
      // event. this is not right. fix it.
      reject(err);
    });

    java.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
      resolve();
    });
  });
}

module.exports = {
  writeConfig,
  bootstrap
}
