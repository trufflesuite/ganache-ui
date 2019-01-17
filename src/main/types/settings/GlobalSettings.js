import Settings from "./Settings";

const initialSettings = {
  googleAnalyticsTracking: true,
  cpuAndMemoryProfiling: false,
  firstRun: true,
};

class GlobalSettings extends Settings {
  constructor(directory) {
    super(directory, initialSettings);
  }

  bootstrap() {
    super.bootstrap();
  }
}

export default GlobalSettings;
