const fs = require("fs");
const path = require("path");
const TruffleConfig = require("truffle-config");

function get(projectFile, networkId) {
  if (!fs.existsSync(projectFile)) {
    return "Truffle project config file '" + projectFile + "' does not exist";
  }
  else if (path.basename(projectFile).match(/^truffle(-config)?.js$/) === null) {
    return "Truffle project config file '" + projectFile + "' is not a valid config file (must point to a file with the name 'truffle.js' or 'truffle-config.js'";
  }
  else {
    const configFileDirectory = path.dirname(projectFile);
    const name = path.basename(configFileDirectory);
    let config = new TruffleConfig(configFileDirectory, configFileDirectory, "ganache");
    const output = require(projectFile);
    config.merge(output);

    let contracts = [];
    if (fs.existsSync(config.contracts_build_directory)) {
      contracts = fs.readdirSync(config.contracts_build_directory)
        .filter((file) => file.endsWith(".json"))
        .map((file) => JSON.parse(fs.readFileSync(path.join(config.contracts_build_directory, file), "utf8")))
        .map((contract) => {
          if (contract.networks[networkId]) {
            contract.address = contract.networks[networkId].address
          }

          return contract
        });
    }

    // TODO: watch contracts on the FS for changes and send the project-details-update message

    return { name, config, contracts };
  }
}

module.exports = {
  get
}
