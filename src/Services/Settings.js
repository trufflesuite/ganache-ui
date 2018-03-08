import uuid from 'uuid'
import _ from 'lodash'

const settings = require('electron-settings');

const oldDefaultMnemonic =  "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";

const initialSettings = {
  googleAnalyticsTracking: true,
  cpuAndMemoryProfiling: false,
  verboseLogging: false,
  firstRun: true,
  randomizeMnemonicOnStart: false,
  server: {
    hostname: "127.0.0.1",
    port: 7545,
    network_id: 5777,
    total_accounts: 10,
    unlocked_accounts: [],
    vmErrorsOnRPCResponse: true
  }
}

class Settings {
  get (key, defaultValue = null) {
    return removeNullSettings(this._getRaw(key, defaultValue))
  }

  _getRaw (key, defaultValue = null) {
    return settings.get(key, defaultValue);  
  }

  getAll () {
    return removeNullSettings(this._getAllRaw());
  }

  _getAllRaw () {
    // We used to delete some keys to toggle certain settings off, or to imply
    // default behavior. However if we do that then the settings migration logic in
    // the bootstrap method won't be able to tell that we're aware of this
    // setting already, causing it to apply the initial default value the next
    // time the application starts. Setting it to null gives the merge logic
    // something to override the initial default with. This is fine, so long as
    // we preserve the semantics of "null" meaning "purposefully left unset".
    // Further, we strip out nulls in Settings.getAll just to be certain that
    // nothing can surprise us by interpreting a key with a null value
    // differently from a missing key.
    return settings.getAll();
  }

  onChange (key, fn) {
    settings.watch(key, fn);
  }

  setAll (obj) {
    // The loop over Object.keys(obj) below doesn't prevent overwriting stored
    // null values in nested objects, so we make sure to preserve them here.
    obj = _.merge({}, this._getAllRaw(), obj)

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

    // Ensure new settings variables get added by merging all the settings,
    // where the current values take precedence. 
    let currentSettings = this._getAllRaw()

    // Add any non-additive settings changes here by creating a function which
    // handles the settings change in question.
    currentSettings = this.migrateMnemonicSettings(currentSettings);

    currentSettings = _.merge({}, initialSettings, currentSettings);

    // Apply the merged settings
    this.setAll(currentSettings);
  }

  migrateMnemonicSettings(currentSettings) {
    // If we're migrating a settings file from before we used a persistent,
    // randomly generated mnemonic by default, randomizeMnemonic on start will
    // be undefined.
    if (currentSettings.randomizeMnemonicOnStart === undefined) {

      // Before we added the randomizeMnemonicOnStart flag, the absence of a
      // mnemonic meant that we wanted a random one one each run. We want to
      // preserve this preference.
      if (currentSettings.server.mnemonic === "") {
        currentSettings.randomizeMnemonicOnStart = true;
      } else if (currentSettings.server.mnemonic === oldDefaultMnemonic || !currentSettings.server.mnemonic) {

        // This will cause a new mnemonic to be generated and persisted only in
        // the case when the old default mnemonic was being used.
        currentSettings.server.mnemonic = null;
      }
    }

    return currentSettings;
  }

  /**
   * Called when a new mnemonic is read back from the underlying chain, will
   * persist this new mnemonic if it differs from the one stored and if
   * randomizeMnemonicOnStart is false.
   */
  handleNewMnemonic(mnemonic) {
    let currentSettings = this._getAllRaw()
    if (!currentSettings.randomizeMnemonicOnStart) {
      this.set('server.mnemonic', mnemonic);
    }
  }
}

let removeNullSettings = function(options) {

  // get rid of nulls first, because apparently typeof null === object :-(
  if (options === null) {
    return undefined
  }

  // Treat anything iterable other than strings as an Array
  // Note: it may be possible to contrive a situation for which this won't
  // work, however until we have a counterexample lets assume it'll work for
  // cleaning up settings
  if (typeof options !== 'string' && typeof options[Symbol.iterator] === 'function') {
    let arr = [...options]
    return _removeNullSettingsFromArray(arr)
  } else switch (typeof options) {
    case 'undefined':
      return undefined
    case 'object':
      return  _removeNullSettingsFromObject(options)
    default:
      // value type
      return options
  }
}

let _removeNullSettingsFromObject = function(obj) {
  let result = {}
  for (let key of Object.keys(obj)) {
    let value = removeNullSettings(obj[key])
    if (value !== undefined) {
      result[key] = value
    }
  }
  return result
}

let _removeNullSettingsFromArray = function(arr) {
  let result = []

  for (let initialValue of arr) {
    let value = removeNullSettings(initialValue)
    if (value !== undefined) {
      result.push(value)
    }
  }

  return result
}


export default Settings
