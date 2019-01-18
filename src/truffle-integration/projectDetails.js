const path = require("path");
const child_process = require("child_process");
const TruffleConfig = require("truffle-config");

async function get(projectFile) {
  const configFileDirectory = path.dirname(projectFile);
  const name = path.basename(configFileDirectory);

  return new Promise((resolve, reject) => {
    try {
      const projectLoaderPath = path.join(
        __dirname,
        "../truffle-project-loader",
        "index.js",
      );
      const args = [projectLoaderPath, projectFile];
      const options = {
        stdio: ["pipe", "pipe", "pipe", "ipc"],
      };
      const child = child_process.spawn("node", args, options);
      child.on("error", error => {
        if (error.code === "ENOENT") {
          throw new Error(
            "Could not find 'node'. NodeJS is required to be installed to link Truffle projects.",
          );
        } else {
          throw new Error(error);
        }
      });
      child.stderr.on("data", data => {
        throw new Error(data);
      });
      child.on("message", async output => {
        let config = new TruffleConfig(
          configFileDirectory,
          configFileDirectory,
          "ganache",
        );
        config.merge(output);

        let contracts = [];

        const response = {
          name: name,
          configFile: projectFile,
          config: {
            truffle_directory: config.truffle_directory,
            build_directory: config.build_directory,
            contracts_build_directory: config.contracts_build_directory,
          },
          contracts,
        };

        resolve(response);
      });
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  get,
};
