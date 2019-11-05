const { NetworkManager } = require("./utils/network");

(async () => {
  const manager = new NetworkManager();
  await manager.bootstrap(2,1);
  console.log("STARTING");
  await manager.start();
})();
