import fs from 'fs'
import _ from 'lodash'
import SysLog from 'electron-log'
import initalSettings from './SettingsService/InitialSettings'
import createJSON from './SettingsService/JsonCreator'

class Settings {
  constructor (jsonPrefix, wipeOldData) {
    this.PATH = createJSON(`${jsonPrefix || ''}.settings`)
    this.data = Object.assign({}, initalSettings)
    this.lastSync = 0
    this.saving = null

    if (fs.existsSync(this.PATH) && !wipeOldData) {
      this._load()
    } else {
      this._save(true)
      // DEV: Handle windows users running as admin...
      fs.chmodSync(this.PATH, '777')
    }

    this._hooks = {}
  }

  get (key, defaultValue = null) {
    this._load()
    return typeof this.data[key] === 'undefined' ? defaultValue : this.data[key]
  }

  getAll () {
    this._load()
    return this.data
  }

  onChange (key, fn) {
    this._hooks[key] = this._hooks[key] || []
    this._hooks[key].push(fn)
  }

  set (key, value) {
    const valChanged = this.data[key] !== value
    this.data[key] = value
    if (this._hooks[key] && valChanged) {
      this._hooks[key].forEach((hookFn) => hookFn(value))
    }
    this._save()
  }

  _load (retryCount = 5) {
    if (this.saving) {
      return this.data
    }

    let userSettings
    try {
      userSettings = JSON.parse(fs.readFileSync(this.PATH, 'utf8'))
    } catch (e) {
      if (retryCount > 0) {
        setTimeout(this._load.bind(this, retryCount - 1), 10)
        SysLog.error('Failed to load settings JSON file, retyring in 10 milliseconds')
        return
      }
      userSettings = {}
      SysLog.error('Failed to load settings JSON file, giving up and resetting')
    }
    this.data = _.extend({}, initalSettings, userSettings)
  }

  _save (force) {
    const now = (new Date()).getTime()
    // During some save events (like resize) we need to queue the disk writes
    // so that we don't blast the disk every millisecond
    if ((now - this.lastSync > 250 || force)) {
      if (this.data) {
        try {
          fs.writeFileSync(this.PATH, JSON.stringify(this.data, null, 4))
        } catch (e) {
          if (this.saving) clearTimeout(this.saving)
          this.saving = setTimeout(this._save.bind(this), 275)
        }
      }
      if (this.saving) {
        clearTimeout(this.saving)
        this.saving = null
      }
    } else {
      if (this.saving) clearTimeout(this.saving)
      this.saving = setTimeout(this._save.bind(this), 275)
    }
    this.lastSync = now
  }

  destroy () {
    this.data = null
    fs.existsSync(this.PATH) && fs.unlinkSync(this.PATH)
  }
}

export default Settings
