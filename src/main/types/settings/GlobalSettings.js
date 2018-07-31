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
  }
}

export default GlobalSettings