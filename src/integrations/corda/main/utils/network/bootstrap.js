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

// const alphabet = "abcdefghijklmnopqrstuvwxyz";
const bootstrap = async (nodes, notaries, startPort, path = "integrations/corda") => {
  console.log(__dirname);
  
  const projectHome = join(__dirname, "../../../../../..", path);
  console.log(projectHome);
  
  const getPort = port(startPort);
  const getNonce = ((val) => () => val++)(0);
  const names = [];
  
  for (let i = 0; i < notaries; i++) {
    // 
    const name = `notary${i}`;
    names.push(name);
    const stream = createWriteStream(join(projectHome, "corda", `${name}_node.conf`));
    generate(templates.notary, { getPort, getNonce, write: (val) => stream.write(`${val}\n`, "utf8") });
    const close = waitForClose(stream).catch(console.log);
    stream.end();
    await close;
    //

  }

  for (let i = 0; i < nodes; i++) {
    const name = `party${i}`;
    names.push(name);
    const stream = createWriteStream(join(projectHome, "corda", `${name}_node.conf`));
    const close = waitForClose(stream).catch(console.log);
    generate(templates.node, { getPort, getNonce, write: (val) => stream.write(`${val}\n`, "utf8") });
    stream.end();
    await close;
  }
  
  console.log(process.cwd());
  console.log(join(path, "corda", `test_node.conf`));
  const JAVA_HOME = join(projectHome, "java/OpenJDK", "OpenJDK8U-jre_x64_linux_hotspot_8u232b09");

  console.log(JAVA_HOME);
  // const commands = [];
  // commands.push(`JAVA_HOME=${JAVA_HOME}`);
  // commands.push(`PATH=$JAVA_HOME/bin:$PATH`);
  // commands.push(`java -jar ${join(projectHome, "corda-tools-network-bootstrapper-4.1.jar")}`);
  // commands.push(`--dir ${join(projectHome, "corda")}`);

  // const command = commands.join(" ");

  // console.log(command);

  const java = spawn("java", ["-jar", `${join(projectHome, "corda-tools-network-bootstrapper-4.1.jar")}`, "--dir", join(projectHome, "corda")], {
    env : {
      PATH : `${JAVA_HOME}/bin:$PATH`
    }
  });

  java.stdout.on('data', (data) => {
    console.log(`stdout:\n${data}`);
  });

  java.stderr.on('data', (data) => {
    console.error(`stderr:\n${data}`);
  });

  java.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
  // const networkBootstrap = exec(command,
  //   function (error, stdout, stderr) {
  //       console.log('stdout: ' + stdout);
  //       console.log('stderr: ' + stderr);
  //       if (error !== null) {
  //            console.log('exec error: ' + error);
  //       }
  //   });

  // console.log(networkBootstrap);

}

module.exports = bootstrap;
