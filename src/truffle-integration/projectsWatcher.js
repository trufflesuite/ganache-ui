const Web3 = require("web3");
const HttpProvider = require("web3-providers-http");
const WsProvider = require("web3-providers-ws");
const EventEmitter = require("events");
const path = require("path");
const { URL } = require("url");
const clonedeep = require("lodash.clonedeep");

const ProjectFsWatcher = require("./projectFsWatcher");

class ProjectsWatcher extends EventEmitter {
  constructor() {
    super();
    this.projects = [];
    this.blocksReceived = [];
    this.subscribedTopics = [];
  }

  close() {
    if (this.blockHeaderSubscription) {
      this.blockHeaderSubscription.unsubscribe();
      delete this.blockHeaderSubscription;
    }
    if (this.logsSubscription) {
      this.logsSubscription.unsubscribe();
      delete this.logsSubscription;
    }

    this.projects = [];
    this.contractsByAddress = {};
    this.blocksReceived = [];
  }

  async setWeb3(url) {
    let parsedURL = new URL(url);
    let scheme = parsedURL.protocol.toLowerCase();

    if (scheme === "ws:" || scheme === "wss:") {
      this.web3 = new Web3(new WsProvider(url));
    } else {
      this.web3 = new Web3(new HttpProvider(url));
    }

    this.blockHeaderSubscription = this.web3.eth.subscribe(
      "newBlockHeaders",
      error => {
        if (error) {
          throw error;
        }
      },
    );

    this.blockHeaderSubscription.on("data", async block => {
      if (this.blocksReceived.indexOf(block.number) === -1) {
        this.blocksReceived.push(block.number);
        await this.handleBlock(block);
      }
    });

    this.logsSubscription = this.web3.eth.subscribe(
      "logs",
      {
        fromBlock: null,
        topics: null,
      },
      error => {
        if (error) {
          throw error;
        }
      },
    );

    this.logsSubscription.on("data", async log => {
      await this.handleLog(log);
    });

    await this.validateContractsOnChain();
  }

  async validateContractsOnChain() {
    for (
      let projectIndex = 0;
      projectIndex < this.projects.length;
      projectIndex++
    ) {
      let tempProject = this.projects[projectIndex].getProject();
      let contracts = [];
      for (let j = 0; j < tempProject.contracts.length; j++) {
        const contract = tempProject.contracts[j];
        let newContract = clonedeep(contract);

        if (contract.address) {
          const bytecode = await this.web3.eth.getCode(contract.address);
          if (contract.deployedBytecode !== bytecode) {
            delete newContract.address;
            delete newContract.creationTxHash;
          }
        }

        contracts.push(newContract);
      }
      this.projects[projectIndex].setContracts(contracts);
      tempProject = this.projects[projectIndex].getProject();
      for (let j = 0; j < tempProject.contracts.length; j++) {
        tempProject.contracts[j].projectIndex = projectIndex;
      }
      this.emit("project-details-update", {
        project: tempProject,
        subscribedTopics: this.subscribedTopics,
      });
    }
  }

  async subscribeToEvents(project) {
    let topics = [];
    for (let i = 0; i < project.contracts.length; i++) {
      const contract = project.contracts[i];
      const abiEvents = contract.abi.filter(entry => {
        return (
          entry.type === "event" &&
          this.subscribedTopics.indexOf(entry.signature) === -1
        );
      });
      topics = topics.concat(abiEvents.map(event => event.signature));
    }
    this.subscribedTopics = this.subscribedTopics.concat(topics);
  }

  async add(project, networkId) {
    const fsWatcher = new ProjectFsWatcher(project, networkId);

    const projectIndex = this.projects.length;
    fsWatcher.on("project-details-update", async data => {
      await this.subscribeToEvents(data);
      for (let i = 0; i < data.contracts.length; i++) {
        data.contracts[i].projectIndex = projectIndex;
      }
      this.emit("project-details-update", {
        project: data,
        subscribedTopics: this.subscribedTopics,
      });
    });

    this.projects.push(fsWatcher);

    const tempProject = fsWatcher.getProject();

    for (let i = 0; i < tempProject.contracts.length; i++) {
      tempProject.contracts[i].projectIndex = projectIndex;
    }

    await this.subscribeToEvents(tempProject);

    return tempProject;
  }

  remove(projectPath) {
    // TODO: might be an easier way now
    let truffleDirectory = projectPath;
    if (
      path.basename(truffleDirectory).match(/truffle(-config)?.js/) !== null
    ) {
      truffleDirectory = path.dirname(truffleDirectory);
    }

    for (let i = 0; i < this.projects.length; i++) {
      const fsWatcher = this.projects[i];
      if (fsWatcher.project.truffle_directory === truffleDirectory) {
        this.projects[i].removeAllListeners();
        this.projects[i].stop();
        this.projects.splice(i);
        break;
      }
    }
  }

  async handleBlock(block) {
    const blockDetails = await this.web3.eth.getBlock(block.number, true);

    for (let k = 0; k < blockDetails.transactions.length; k++) {
      const transaction = blockDetails.transactions[k];
      for (let i = 0; i < this.projects.length; i++) {
        const project = this.projects[i];
        for (let j = 0; j < project.contracts.length; j++) {
          const contract = project.contracts[j];

          // TODO: I switched to `project-details-update` event instead
          //       of `contract-deployed` as the whole project got pushed
          //       which allowed for some better linking. Below is the old
          //       code which looked at block headers, which will be necessary
          //       for non-truffle-migrated contracts (i.e. factory pattern).
          //       my suggestion is to change `contract.address` to `contract.addresses`
          //       which has has one address if `this.projects[i].contracts[j].address is valid,
          //       otherwise we'll need to keep an internal list of deployed contracts for this instance?
          // // check if one of our watched projects was deployed
          // if (transaction.to === null && transaction.input === contract.bytecode) {
          //   // this contract was deployed in this contract
          //   contract.address = this.web3.utils.toChecksumAddress("0x" + keccak('keccak256').update(rlp.encode([transaction.from, transaction.nonce])).digest('hex').substring(24));
          //   this.contractsByAddress[contract.address] = contract;
          //   this.emit("contract-deployed", {
          //     truffleDirectory: project.truffle_directory,
          //     transactionHash: transaction.hash,
          //     contractName: contract.contractName,
          //     contractAddress: contract.address
          //   });
          // }

          if (contract.address && transaction.to === contract.address) {
            // this contract had a transaction on it
            this.emit("contract-transaction", {
              truffleDirectory: project.truffle_directory,
              contractAddress: contract.address,
              transactionHash: transaction.hash,
            });
          }
        }
      }
    }
  }

  handleLog(log) {
    for (let i = 0; i < log.topics.length; i++) {
      if (this.subscribedTopics.indexOf(log.topics[i]) >= 0) {
        this.emit("contract-event", {
          contractAddress: log.address,
          transactionHash: log.transactionHash,
          logIndex: log.logIndex,
        });
      }
    }
  }
}

module.exports = ProjectsWatcher;
