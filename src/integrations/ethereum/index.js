import Integrations from "../integrations";
import TruffleIntegrationService from "./common/services/TruffleIntegrationService";
import EthereumChainService from "./common/services/EthereumChainService";
import { GET_CONTRACT_DETAILS, CONTRACT_EVENT, CONTRACT_TRANSACTION, PROJECT_UPDATED } from "./common/redux/workspaces/actions";
import { SET_SYSTEM_ERROR } from "../../common/redux/core/actions";
import { GET_DECODED_TRANSACTION_INPUT } from "./common/redux/transactions/actions";
import { GET_DECODED_EVENT, SET_SUBSCRIBED_TOPICS } from "./common/redux/events/actions";
import { SET_KEY_DATA } from "./common/redux/core/actions";

class Ethereum extends Integrations {
  constructor(integrationManager) {
    super(integrationManager);

    this.projectIntegration = new TruffleIntegrationService(integrationManager.isDevMode);
    this.chain = new EthereumChainService(integrationManager.config);

    this._listen();
  }

  async _listen() {
    this._listenToIPC();
    this._listenToTruffle();
    
    this.chain.on("server-started", (data) => {
      const workspace = this._integrationManager.workspace;
      this.send(SET_KEY_DATA, {
        privateKeys: data.privateKeys,
        mnemonic: data.mnemonic,
        hdPath: data.hdPath,
        fork_block_number: data.fork_block_number
      });

      workspace.settings.handleNewMnemonic(data.mnemonic);
      workspace.settings.handleNewForkBlockNumber(data.fork_block_number);
    })

    this.chain.on("message", this.emit.bind(this, "message"));
  }

  async _listenToIPC() {
    this.ipc.on(
      GET_CONTRACT_DETAILS,
      async (event, contract, contracts, block) => {
        const state = await this.projectIntegration.getContractState(
          contract,
          contracts,
          block,
        );
        this.send(GET_CONTRACT_DETAILS, state);
      },
    );

    this.ipc.on("web3-provider", (event, url) => {
      this.projectIntegration.setWeb3(url);
    });

    this.ipc.on(GET_DECODED_EVENT, async (event, contract, contracts, log) => {
      try {
        const decodedLog = await this.projectIntegration.getDecodedEvent(
          contract,
          contracts,
          log,
        );
        this.send(GET_DECODED_EVENT, decodedLog);
      } catch (e) {
        this.send(GET_DECODED_EVENT, {
          error: { stack: e.stack, messages: e.message },
        });
      }
    });

    this.ipc.on(
      GET_DECODED_TRANSACTION_INPUT,
      async (event, contract, contracts, transaction) => {
        try {
          const decodedData = await this.projectIntegration.getDecodedTransaction(
            contract,
            contracts,
            transaction,
          );
          this.send(
            GET_DECODED_TRANSACTION_INPUT,
            decodedData,
          );
        } catch (e) {
          this.send(GET_DECODED_TRANSACTION_INPUT, {
            error: { stack: e.stack, messages: e.message },
          });
        }
      },
    );
  }

  async _listenToTruffle() {
    console.log("listen to truffle");
    const projectIntegration = this.projectIntegration;
    projectIntegration.on("error", async error => {
      await projectIntegration.stopWatching();

      if (this.chain.isServerStarted()) {
        // Something wrong happened in the chain, let's try to stop it
        this.send(SET_SYSTEM_ERROR, error);
        await this.stopServer();
      } else {
        this.chain.once("server-started", () => {
          this.send(SET_SYSTEM_ERROR, error);
        });
      }
    });

    projectIntegration.on("project-details-update", async data => {
      this.send(PROJECT_UPDATED, data.project);
      this.send(
        SET_SUBSCRIBED_TOPICS,
        data.subscribedTopics,
      );
    });

    projectIntegration.on("contract-transaction", data => {
      this.send(CONTRACT_TRANSACTION, data);

      this._integrationManager.workspace.contractCache.addTransaction(
        data.contractAddress,
        data.transactionHash,
      );
    });

    projectIntegration.on("contract-event", data => {
      this.send(CONTRACT_EVENT, data);

      this._integrationManager.workspace.contractCache.addEvent(data.contractAddress, {
        transactionHash: data.transactionHash,
        logIndex: data.logIndex,
      });
    });
  }

  async start() {
    return Promise.all([
      this.projectIntegration.start(),
      this.chain.start()
    ]);
  }

  async startServer(workspaceSettings) {
    return this.chain.startServer(workspaceSettings);
  }
  async stop() {
    await this.stopServer();
    return Promise.all([
      this.chain.stop(),
      this.projectIntegration.stopProcess()
    ]);
  }
  async stopServer() {
    await this.projectIntegration.stopWatching();
    return this.chain.stopServer();
  }
}

export default Ethereum;