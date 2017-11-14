import uuid from 'uuid'
import _ from 'lodash'

const settings = require('electron-settings');

const initialSettings = {
  googleAnalyticsTracking: true,
  cpuAndMemoryProfiling: false,
  verboseLogging: false,
  firstRun: true,
  server: {
    hostname: "localhost",
    port: 7545,
    network_id: 5777,
    total_accounts: 10,
    unlocked_accounts: [],
    gasLimit: 6721975,
    mnemonic: "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat"
  }
}

class Settings {
  get (key, defaultValue = null) {
    return settings.get(key, defaultValue);  
  }

  getAll () {
    return settings.getAll();
  }

  onChange (key, fn) {
    settings.watch(key, fn);
  }

  setAll (obj) {
    // Translate old setAll to electron-settings setAll
    Object.keys(obj).forEach((key) => {
      this.set(key, obj[key]);
    });
  }

  set (key, value) {
    settings.set(key, value, {prettify: true});
  }

  destroy () {
    //settings.deleteAll();
  }

  bootstrap () {
    if (settings.get("uuid") == null) {
      // Remember: setAll replaces what's there.
      settings.setAll(initialSettings);

      // Set a specific uuid.
      this.set('uuid', uuid.v4()) 
    }

    // Ensure new settings variables get added by merging
    // all the settings, where the current values take precedence. 
    var currentSettings = settings.getAll();

    // Apply the merged settings
    this.setAll(currentSettings);
  }
}

export default Settings
