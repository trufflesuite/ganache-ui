import Settings from "./Settings";
import merge from "lodash.merge";

const oldDefaultMnemonic =
  "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";

const initialSettings = {
  name: "Quickstart",
  isDefault: true,
  verboseLogging: false,
  randomizeMnemonicOnStart: false,
  logsDirectory: null,
  server: {
    hostname: "127.0.0.1",
    port: 7545,
    network_id: 5777,
    default_balance_ether: 100,
    total_accounts: 10,
    unlocked_accounts: [],
    locked: false,
    vmErrorsOnRPCResponse: true,
    logger: null,
    verbose: false,
    gasLimit: 6721975,
    gasPrice: 20000000000,
    hardfork: "constantinople",
  },
  projects: [],
};

class WorkspaceSettings extends Settings {
  constructor(directory, chaindataDirectory) {
    super(directory, initialSettings);

    this.chaindataDirectory = chaindataDirectory;

    this.defaultSettings = {
      server: {
        gasLimit: initialSettings.server.gasLimit,
        gasPrice: initialSettings.server.gasPrice,
        hardfork: initialSettings.server.hardfork,
      },
    };
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
  if (currentSettings.randomizeMnemonicOnStart === undefined) {
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
