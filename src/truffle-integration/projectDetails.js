const fs = require("fs");
const path = require("path");
const child_process = require("child_process");
const TruffleConfig = require("truffle-config");
const temp = require("temp");
const { promisify } = require("util");
const exec = promisify(child_process.exec.bind(child_process));

const noNodeErrorMessage =
  "Could not find 'node'. Node.js is required to be installed to link Truffle projects.";

async function getNodeVersionFromShell(shell, nvmDir) {
  try {
    const nvmPath = path.join(nvmDir, "nvm.sh");
    const nodeVersion = await exec(
      `unset npm_config_prefix && source ${nvmPath} && nvm_resolve_local_alias default`,
      {
        shell,
        encoding: "utf8",
      },
    );
    if (typeof nodeVersion === "string") {
      return nodeVersion.trim();
    }
  } catch (e) {
    throw e;
    // We throw the error away because we really only care if it worked or not
  }
  return null;
}

async function attemptRetry(projectFile) {
  // Windows is SOL at this point. If people are installing node via nvm-windows
  // (https://github.com/coreybutler/nvm-windows) and manage to ignore the path
  // the same way linux does we can try to handle that here. For now, just bail.
  if (process.platform === "win32") {
    throw new Error(noNodeErrorMessage);
  }
  const nvmDir = path.join(process.env.HOME, ".nvm");
  const shellLocations = ["/bin/bash", "/usr/bin/bash"];
  // search shell locations for our node version
  let nodeVersion = null;
  for (let i = 0; i < shellLocations.length && nodeVersion == null; i++) {
    nodeVersion = await getNodeVersionFromShell(shellLocations[i], nvmDir);
  }

  // if we still don't have a node version we're SOL
  if (!nodeVersion) {
    throw new Error(noNodeErrorMessage);
  }

  // now fix up the PATH to include our user's node dir
  const nodeDir = path.join(nvmDir, "versions", "node", nodeVersion, "bin");
  process.env.PATH = nodeDir + path.delimiter + (process.env.PATH || "");
  process.env.NVM_DIR = nvmDir;

  return await get(projectFile, true);
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
        const response = {
          name: name,
          configFile: projectFile,
          config: {},
          contracts: [],
        };
        if (error.code === "ENOENT") {
          // could not find node. check to see if they have ~/.nvm
          if (isRetry) {
            response.error = error.message;
          } else {
            try {
              resolve(await attemptRetry(projectFile));
              return;
            } catch (e) {
              // Don't crash if we can't do anything about it. Just inform
              // the user of the error
              response.error = e.message;
            }
          }
        } else {
          response.error = error.message;
        }
        resolve(response);
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
