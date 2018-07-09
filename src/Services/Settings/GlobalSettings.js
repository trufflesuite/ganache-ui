import UUID from 'uuid'
import Settings from './Settings'

const initialSettings = {
  googleAnalyticsTracking: true,
  cpuAndMemoryProfiling: false,
  firstRun: true
}

class GlobalSettings extends Settings {
  constructor(directory) {
    super(directory, initialSettings)
  }

  async bootstrap() {
    await super.bootstrap()

    const uuid = await this.settings.get("uuid")
    if (typeof uuid == 'undefined') {
      // Remember: setAll replaces what's there.
      await this.settings.setAll(this.initialSettings);

      // Set a specific uuid.
      await this.set('uuid', UUID.v4()) 
    }
  }
}

export default GlobalSettings