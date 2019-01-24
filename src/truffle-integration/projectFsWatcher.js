const EventEmitter = require("events");
const path = require("path");
const fs = require("fs");
const getProjectDetails = require("./projectDetails").get;
const merge = require("lodash.merge");
const { getAncestorDirs } = require("./projectFsWatcherUtils");

/**
 * Detects when there are new/changed/removed contract artifacts in contracts_build_directory
 */
class ProjectFsWatcher extends EventEmitter {
  constructor(project, networkId) {
    super();

    this.project = project;
    this.networkId = networkId;

    this.configWatcher = null;
    this.contractBuildDirectoryWatcher = null;
    this.dirWatchers = {};

    this.contracts = [];
    this.fileToContractIdx = {};

    this.start();
  }

  getProject() {
    const tempProject = merge({}, this.project, {
      contracts: this.contracts.filter(contract => contract !== null),
    });
    return tempProject;
  }

  setContracts(contracts) {
    this.contracts = contracts;
  }

  start() {
    this.configWatcher = fs.watch(
      this.project.configFile,
      { encoding: "utf8" },
      async () => {
        // the config file was either removed or changed, we may want to reload it

        this.stopWatchingDirs();

        this.project = await getProjectDetails(this.project.configFile);
        // do we want to emit the project potencially got changed?

        this.startWatchingDirs(
          getAncestorDirs(
            this.project.config.truffle_directory,
            this.project.config.contracts_build_directory,
          ),
        );
      },
    );

    this.startWatchingDirs(
      getAncestorDirs(
        this.project.config.truffle_directory,
        this.project.config.contracts_build_directory,
      ),
    );
  }

  stopWatchingDirs() {
    Object.keys(this.dirWatchers).forEach(dir => this.stopWatchingDir(dir));
  }

  /**
   * @param {string} dir The directory name
   */
  stopWatchingDir(dir) {
    if (this.dirWatchers[dir]) {
      this.dirWatchers[dir].close();
      // There's no object spread, so just delete the key
      delete this.dirWatchers[dir];
    }
  }

  /**
   * @param {string[]} dirs An array of directory names
   */
  startWatchingDirs(dirs) {
    const [head, ...tail] = dirs;

    if (head) this.stopWatchingDir(head);

    if (head && fs.existsSync(head)) {
      const watcher = fs.watch(
        head,
        { encoding: "utf8" },
        (eventType, filename) => {
          if (
            filename ===
            path.basename(this.project.config.contracts_build_directory)
          ) {
            this.startWatchingContracts();
          }

          if (tail[0] && filename === path.basename(tail[0]))
            this.startWatchingDirs(tail);
        },
      );
      this.dirWatchers[head] = watcher;
      this.startWatchingDirs(tail);
    } else {
      // When dirs === [], we assume that we are at the contracts_build_directory, so just start watching it
      this.startWatchingContracts();
    }
  }

  contractExists(file) {
    return fs.existsSync(
      path.join(this.project.config.contracts_build_directory, file),
    );
  }

  readContract(file) {
    try {
      const contract = JSON.parse(
        fs.readFileSync(
          path.join(this.project.config.contracts_build_directory, file),
          "utf8",
        ),
      );

      if (contract.networks[this.networkId]) {
        contract.address = contract.networks[this.networkId].address;
        contract.creationTxHash =
          contract.networks[this.networkId].transactionHash;
      }

      return contract;
    } catch (e) {
      return null;
    }
  }

  readContracts() {
    const files = fs.readdirSync(this.project.config.contracts_build_directory);
    for (let i = 0; i < files.length; i++) {
      const extension = path.extname(files[i]);
      if (extension === ".json") {
        this.fileToContractIdx[files[i]] = this.contracts.length;
        const contract = this.readContract(files[i]);
        this.contracts.push(contract);
      }
    }
  }

  handleContractFileEvent(eventType, filename) {
    const extension = path.extname(filename);
    if (extension === ".json") {
      if (eventType === "rename") {
        if (this.contractExists(filename)) {
          // created
          this.fileToContractIdx[filename] = this.contracts.length;
          const contract = this.readContract(filename);
          this.contracts.push(contract);
        } else {
          // deleted
          this.contracts.splice(this.fileToContractIdx[filename]);
          delete this.fileToContractIdx[filename];
        }
      } else if (eventType === "change") {
        // modified
        const contract = this.readContract(filename);
        this.contracts[this.fileToContractIdx[filename]] = contract;
      }
    }
  }

  startWatchingContracts() {
    this.stopWatchingContracts();

    if (fs.existsSync(this.project.config.contracts_build_directory)) {
      this.readContracts();

      this.contractBuildDirectoryWatcher = fs.watch(
        this.project.config.contracts_build_directory,
        { encoding: "utf8" },
        (eventType, filename) => {
          this.handleContractFileEvent(eventType, filename);
          this.emit("project-details-update", this.getProject());
        },
      );
    }

    this.emit("project-details-update", this.getProject());
  }

  stopWatchingContracts() {
    if (this.contractBuildDirectoryWatcher)
      this.contractBuildDirectoryWatcher.close();
    this.contractBuildDirectoryWatcher = null;

    this.contracts = [];
    this.fileToContractIdx = {};
  }

  stop() {
    if (this.configWatcher) this.configWatcher.close();
    this.stopWatchingDirs();
    this.stopWatchingContracts();
  }
}

module.exports = ProjectFsWatcher;
