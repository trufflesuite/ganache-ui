import Settings from "./Settings";
import merge from "lodash.merge";

const oldDefaultMnemonic = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";

const ethereumInitialSettings = require("./flavors/ethereum");
const cordaInitialSettings = require("./flavors/corda");

class WorkspaceSettings extends Settings {
  constructor(directory, chaindataDirectory, flavor = "ethereum") {
    let initialSettings;
    switch(flavor){
      case "ethereum":
          initialSettings = ethereumInitialSettings
      break;
      case "corda":
          initialSettings = cordaInitialSettings
      break;
      default:
        throw new Error("Invalid flavor: " + flavor);
    }
    super(directory, merge({}, initialSettings, {flavor}));

    this.chaindataDirectory = chaindataDirectory;

    if (flavor === "ethereum") {
      this.defaultSettings = {
        server: {
          gasLimit: initialSettings.server.gasLimit,
          gasPrice: initialSettings.server.gasPrice,
          hardfork: initialSettings.server.hardfork,
        }
      };
    }
  }

  bootstrapModification(currentSettings) {
    // Add any settings changes here by creating a function which
    // handles the settings change in question.

    currentSettings = migrateMnemonicSettings(currentSettings);
    currentSettings = this.insertDbPath(currentSettings);

    return currentSettings;
  }

  /**
   * Called when a new mnemonic is read back from the underlying chain, will
   * persist this new mnemonic if it differs from the one stored and if
   * randomizeMnemonicOnStart is false.
   */
  handleNewMnemonic(mnemonic) {
    if (!this._getRaw("randomizeMnemonicOnStart", true)) {
      this.set("server.mnemonic", mnemonic);
    }
  }

  handleNewForkBlockNumber(forkBlockNumber) {
    this.set("server.fork_block_number", forkBlockNumber);
  }

  insertDbPath(currentSettings) {
    if (this.chaindataDirectory) {
      return merge({}, currentSettings, {
        server: {
          db_path: this.chaindataDirectory,
        },
      });
    } else {
      return currentSettings;
    }
  }
}

const migrateMnemonicSettings = function(currentSettings) {
  // If we're migrating a settings file from before we used a persistent,
  // randomly generated mnemonic by default, randomizeMnemonic on start will
  // be undefined.
  if (currentSettings.randomizeMnemonicOnStart === undefined && currentSettings.server) {
    // Before we added the randomizeMnemonicOnStart flag, the absence of a
    // mnemonic meant that we wanted a random one one each run. We want to
    // preserve this preference.
    if (currentSettings.server.mnemonic === "") {
      currentSettings.randomizeMnemonicOnStart = true;
    } else if (
      currentSettings.server.mnemonic === oldDefaultMnemonic ||
      !currentSettings.server.mnemonic
    ) {
      // This will cause a new mnemonic to be generated and persisted only in
      // the case when the old default mnemonic was being used.
      currentSettings.server.mnemonic = null;
    }
  }

  return currentSettings;
};

export default WorkspaceSettings;
