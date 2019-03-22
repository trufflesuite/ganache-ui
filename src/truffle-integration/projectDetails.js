const fs = require("fs");
const path = require("path");
const child_process = require("child_process");
const TruffleConfig = require("truffle-config");
const temp = require("temp");

const noNodeErrorMessage =
  "Could not find 'node'. NodeJS is required to be installed to link Truffle projects.";

async function attemptRetry(projectFile) {
  const nvmDir = path.join(process.env.HOME, ".nvm");

  if (fs.existsSync(nvmDir)) {
    let shell;

    if (fs.existsSync("/bin/bash")) {
      shell = "/bin/bash";
    } else if (fs.existsSync("/usr/bin/bash")) {
      shell = "/usr/bin/bash";
    } else {
      throw new Error(noNodeErrorMessage);
    }

    process.env.NVM_DIR = nvmDir;
    const nodeVersion = child_process
      .execSync(
        "source " +
          path.join(nvmDir, "nvm.sh") +
          " && nvm_resolve_local_alias default",
        {
          shell: shell,
          encoding: "utf8",
        },
      )
      .trim();

    const nodeDir = path.join(nvmDir, "versions", "node", nodeVersion, "bin");
    process.env.PATH = nodeDir + ":" + process.env.PATH;

    return await get(projectFile, true);
  } else {
    throw new Error(noNodeErrorMessage);
  }
}

async function get(projectFile, isRetry = false) {
  return new Promise(async (resolve, reject) => {
    try {
      const configFileDirectory = path.dirname(projectFile);
      const name = path.basename(configFileDirectory);

      temp.track();
      const tempDir = await new Promise((resolve, reject) => {
        temp.mkdir("ganache", (err, tempDir) => {
          if (err) reject(err);

          resolve(tempDir);
        });
      });

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

      const projectLoaderFile = await new Promise((resolve, reject) => {
        fs.readFile(oldProjectLoaderLocation, null, (err, data) => {
          if (err) reject(err);

          resolve(data);
        });
      });

      const newProjectLoaderLocation = path.join(tempDir, "index.js");
      await new Promise((resolve, reject) => {
        fs.writeFile(newProjectLoaderLocation, projectLoaderFile, err => {
          if (err) reject(err);

          resolve();
        });
      });

      const args = [newProjectLoaderLocation, projectFile];
      const options = {
        stdio: ["pipe", "pipe", "pipe", "ipc"],
      };
      const child = child_process.spawn("node", args, options);
      child.on("error", async error => {
        if (error.code === "ENOENT") {
          // could not find node. check to see if they have ~/.nvm
          if (!isRetry) {
            resolve(await attemptRetry(projectFile));
          } else {
            throw new Error(noNodeErrorMessage);
          }
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
