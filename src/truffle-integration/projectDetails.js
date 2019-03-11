const fs = require("fs");
const path = require("path");
const child_process = require("child_process");
const TruffleConfig = require("truffle-config");
const temp = require("temp");

async function get(projectFile) {
  temp.track();

  const tempDir = temp.mkdirSync();

  let oldProjectLoaderLocation;
  if (process.env.GANACHE_DEV_MODE === "true") {
    oldProjectLoaderLocation = path.join(
      process.env.ELECTRON_APP_PATH,
      "src",
      "truffle-project-loader",
      "index.js",
    );
  } else {
    oldProjectLoaderLocation = path.join(
      process.env.ELECTRON_APP_PATH,
      "..",
      "..",
      "src",
      "truffle-project-loader",
      "index.js",
    );
  }

  const projectLoaderFile = fs.readFileSync(oldProjectLoaderLocation);
  const newProjectLoaderLocation = path.join(tempDir, "index.js");
  fs.writeFileSync(newProjectLoaderLocation, projectLoaderFile);

  const configFileDirectory = path.dirname(projectFile);
  const name = path.basename(configFileDirectory);

  return new Promise((resolve, reject) => {
    try {
      const args = [newProjectLoaderLocation, projectFile];
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
