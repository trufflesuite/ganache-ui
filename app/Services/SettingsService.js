import initialSettings from './SettingsService/InitialSettings'
import uuid from 'uuid'
import _ from 'lodash'

const settings = require('electron-settings');

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
    var allSettings = _.merge({}, initialSettings, currentSettings)

    // Apply the merged settings
    this.setAll(allSettings);
  }
}

export default Settings
