const {generate, templates} = require("../config");
const port = require("./port");
const { createWriteStream } = require("fs");
const { join } = require("path");
const exec = require('child_process').exec;

// const alphabet = "abcdefghijklmnopqrstuvwxyz";
const bootstrap = (nodes, notaries, startPort, path) => {
  const getPort = port(startPort);
  const getNonce = ((val) => () => val++)(0);
  const names = [];
  for (let i = 0; i < notaries; i++) {
    // 
    const name = `notary${i}`;
    names.push(name);
    const stream = createWriteStream(join(path, "corda", `${name}_node.conf`));

    //
    generate(templates.notary, { getPort, getNonce, write: (val) => stream.write(`${val}\n`, "utf8") });
    stream.end();
  }
  for (let i = 0; i < nodes; i++) {
    const name = `party${i}`;
    names.push(name);
    const stream = createWriteStream(join(path, "corda", `${name}_node.conf`));

    //
    generate(templates.node, { getPort, getNonce, write: (val) => stream.write(`${val}\n`, "utf8") });
    stream.end();
  }

  const networkBootstrap = exec(`${join(path, "java/OpenJDK/OpenJDK8U-jre_x64_linux_hotspot_8u232b09/bin/java")} -jar ${path}/corda-tools-network-bootstrapper-4.1.jar --dir ${path}/corda`,
    function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
             console.log('exec error: ' + error);
        }
    });

  console.log(networkBootstrap);

}

module.exports = bootstrap;
