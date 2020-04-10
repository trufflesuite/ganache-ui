import EventEmitter from "events";

class CordAppIntegrationService extends EventEmitter {
  constructor(isDevMode) {
    super();
    this.isDevMode = isDevMode;
    this.setMaxListeners(1);
  }

  getProjectDetails(projectConfigFile, _networkId) {
    return new Promise((resolve) => {
        // TODO: ?
        resolve(projectConfigFile);
    });
  }
}

export default CordAppIntegrationService;
