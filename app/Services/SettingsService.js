import initalSettings from './SettingsService/InitialSettings'
import uuid from 'uuid'

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
      settings.setAll(initalSettings);

      // Set a specific uuid if unset.
      this.set('uuid', this.get('uuid', uuid.v4())) 
    }
  }
}

export default Settings
