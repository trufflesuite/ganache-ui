const {generate, templates} = require("../config");
const port = require("./port");
const { createWriteStream } = require("fs");
const { join } = require("path");
const { spawn } = require('child_process');

function waitForEvent( stream, event ){
    return new Promise( resolve  => {
        stream.on( event, resolve )
    })
}

function waitForClose( stream ){
    return waitForEvent(stream, "close");
}

const produceModifier = (...args) => {
  return Object.assign({}, ...args);
}

// const alphabet = "abcdefghijklmnopqrstuvwxyz";
const bootstrap = async (nodes, notaries, startPort, path = "integrations/corda") => {
  const nodesArr = [];
  const notariesArr = [];
  console.log(__dirname);
  
  const projectHome = join(__dirname, "../../../../../..", path);
  console.log(projectHome);
  
  const getPort = port(startPort);
  const getNonce = ((val) => () => val++)(0);

  const modifier = {
    getPort,
    getNonce,
    postgres: {
      port: 5432,
      schema: "mynode"
    }
  }

  for (let i = 0; i < notaries; i++) {
    // 
    const name = `notary${i}`;
    nodesArr.push(name);
    const stream = createWriteStream(join(projectHome, "corda", `${name}_node.conf`));
    const write = (val) => stream.write(`${val}\n`, "utf8");
    generate(templates.notary, produceModifier(modifier, { write }));
    const close = waitForClose(stream).catch(console.log);
    stream.end();
    await close;
    //

  }

  for (let i = 0; i < nodes; i++) {
    const name = `party${i}`;
    notariesArr.push(name);
    const stream = createWriteStream(join(projectHome, "corda", `${name}_node.conf`));
    const close = waitForClose(stream).catch(console.log);
    const write = (val) => stream.write(`${val}\n`, "utf8");
    generate(templates.node, produceModifier(modifier, { write }));
    stream.end();
    await close;
  }
  
  console.log(process.cwd());
  console.log(join(path, "corda", `test_node.conf`));
  const JAVA_HOME = join(projectHome, "java/OpenJDK", "OpenJDK8U-jre_x64_linux_hotspot_8u232b09");

  console.log(JAVA_HOME);

  const java = spawn("java", ["-jar", `${join(projectHome, "corda-tools-network-bootstrapper-4.1.jar")}`, "--dir", join(projectHome, "corda")], {
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

  return new Promise((resolve) => {
    java.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
      resolve({ nodes: nodesArr, notaries: notariesArr });
    });
  });
}

module.exports = bootstrap;
