import _ from 'lodash'
import JsonStorage from '../../Utils/JsonStorage'
import UUID from 'uuid'

class Settings {
  constructor(directory, initialSettings) {
    this.initialSettings = initialSettings
    this.settings = new JsonStorage(directory, 'Settings')
  }

  async get (key, defaultValue = null) {
    const obj = await this._getRaw(key, defaultValue)
    return removeNullSettings(obj)
  }

  async _getRaw (key, defaultValue = null) {
    return await this.settings.get(key, defaultValue)
  }

  async getAll () {
    const obj = await this._getAllRaw()
    return removeNullSettings(obj)
  }

  async _getAllRaw () {
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
    return await this.settings.getAll()
  }

  // TODO: do we want to use the watching ability? it would need to be added
  // onChange (key, fn) {
  //   settings.watch(key, fn);
  // }

  async setAll (obj) {
    // The loop over Object.keys(obj) below doesn't prevent overwriting stored
    // null values in nested objects, so we make sure to preserve them here.
    const currentSettings = await this._getAllRaw()
    obj = _.merge({}, currentSettings, obj)

    await this.settings.setAll(obj)
  }

  async set (key, value) {
    await this.settings.set(key, value);
  }

  destroy () {
    //settings.deleteAll();
  }

  // Extend this function to add any non-additive settings changes
  bootstrapModification(settings) {
    return settings
  }

  async bootstrap () {
    // Ensure new settings variables get added by merging all the settings,
    // where the current values take precedence. 
    let currentSettings = await this._getAllRaw()

    // Add any non-additive settings changes here by creating a function which
    // handles the settings change in question.
    currentSettings = this.bootstrapModification(currentSettings)

    if (typeof currentSettings.uuid == 'undefined') {
      currentSettings.uuid = UUID.v4()
    }

    currentSettings = _.merge({}, this.initialSettings, currentSettings)

    // Apply the merged settings
    await this.setAll(currentSettings)
  }
}

const removeNullSettings = function(options) {
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

const _removeNullSettingsFromObject = function(obj) {
  let result = {}
  for (let key of Object.keys(obj)) {
    let value = removeNullSettings(obj[key])
    if (value !== undefined) {
      result[key] = value
    }
  }
  return result
}

const _removeNullSettingsFromArray = function(arr) {
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
