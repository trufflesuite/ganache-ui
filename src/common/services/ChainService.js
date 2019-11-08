// import EventEmitter from "events";
// import EthereumChainService from "../../integrations/ethereum/common/services/EthereumChainService";
// import CordaChainService from "../../integrations/corda/common/services/CordaChainService";

// class ChainService extends EventEmitter {
//   constructor(config) {
//     super();
//     this._chainService = null;
//     this.flavor = null;
//     this._config = config;
//     this._child = null;
//     this.setMaxListeners(1);
//   }

//   async start(flavor) {
//     let chainService;

//     // if we need to start a new service, stop the old one
//     if (this.flavor !== flavor) {
//       switch (flavor) {
//         case "ethereum":
//           chainService = new EthereumChainService(this._config);
//           break;
//         case "corda":
//           chainService = new CordaChainService(this._config);
//           break;
//         default:
//           throw new Error("Invalid flavor: " + flavor);
//       }
//       if (this._chainService) {
//         await this._chainService.stopServer();
//       }
//       this._chainService = chainService;
//     }

//     this.flavor = flavor;
//     this._chainService.once("start", this.emit.bind(this, "start"));
//     this._chainService.start();
//   }

//   startServer(settings, workspaceDirectory) {
//     if (this._chainService) {
//       this._chainService.once("server-started", this.emit.bind(this, "server-started"));
//       this._chainService.startServer(settings, workspaceDirectory);
//     }
//   }

//   stopServer() {
//     this._chainService && this._chainService.stopServer();
//   }

//   getDbLocation() {
//     this._chainService && this._chainService.getDbLocation();
//   }

//   stopProcess() {
//     this._chainService && this._chainService.stopProcess();
//   }

//   isServerStarted() {
//     return false; // return this._chainService ? this._chainService.isServerStarted() : false;
//   }
// }

// export default ChainService;
