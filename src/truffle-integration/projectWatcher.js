const Web3 = require("web3");
const HttpProvider = require("web3-providers-http");
const WsProvider = require("web3-providers-ws");
const EventEmitter = require("events");
const path = require("path");
const { URL } = require("url");

class ProjectWatcher extends EventEmitter {
  constructor() {
    super();
    this.projects = [];
    this.contractsByAddress = {};
  }

  close() {
    if (this.blockHeaderSubscription) {
      this.blockHeaderSubscription.unsubscribe();
      this.blockHeaderSubscription = undefined;
    }
    if (this.logsSubscription) {
      this.logsSubscription.unsubscribe();
      this.logsSubscription = undefined;
    }
  }

  setWeb3(url) {
    let parsedURL = new URL(url)
    let scheme = parsedURL.protocol.toLowerCase()

    if (scheme === 'ws:' || scheme === 'wss:') {
      this.web3 = new Web3(new WsProvider(url));
    } else {
      this.web3 = new Web3(new HttpProvider(url));
    }

    this.blockHeaderSubscription = this.web3.eth.subscribe("newBlockHeaders");
    this.blockHeaderSubscription.on("data", async (block) => {
      await this.handleBlock(block);
    });
    this.logsSubscription = this.web3.eth.subscribe("logs", {
      fromBlock: null,
      topics: null
    });
    this.logsSubscription.on("data", async (log) => {
      await this.handleLog(log);
    });
  }

  add(project) {
    this.projects.push(project);
  }

  remove(projectPath) {
    let truffleDirectory = projectPath;
    if (path.basename(truffleDirectory).match(/truffle(-config)?.js/) !== null) {
      truffleDirectory = path.dirname(truffleDirectory);
    }

    for (let i = 0; i < this.projects.length; i++) {
      const project = this.projects[i];
      if (project.truffle_directory === truffleDirectory) {
        for (let j = 0; j < project.contracts.length; j++) {
          const contract = project.contracts[j];
          if (contract.address && typeof this.contractsByAddress[contract.address] !== "undefined") {
            delete this.contractsByAddress[contract.address];
          }
        }
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

          // check if one of our watched projects was deployed
          if (transaction.to === null && transaction.input === contract.bytecode) {
            // this contract was deployed in this contract
            const receipt = await this.web3.eth.getTransactionReceipt(transaction.hash);
            contract.address = receipt.contractAddress;
            this.contractsByAddress[contract.address] = contract;
            this.emit("contract-deployed", {
              truffleDirectory: project.truffle_directory,
              transactionHash: transaction.hash,
              contractName: contract.contractName,
              contractAddress: contract.address
            });
          }

          if (contract.address && transaction.to === contract.address) {
            // this contract had a transaction on it
            this.emit("contract-transaction", {
              truffleDirectory: project.truffle_directory,
              contractAddress: contract.address,
              transactionHash: transaction.hash
            });
          }
        }
      }
    }
  }

  handleLog(log) {
    if (typeof this.contractsByAddress[log.address] !== "undefined") {
      // TODO: filter by actual events, not logs in general
      this.emit("contract-event", {
        contractAddress: log.address,
        transactionHash: log.transactionHash,
        logIndex: log.logIndex
      });
    }
  }
}

module.exports = ProjectWatcher;