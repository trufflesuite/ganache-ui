const { NetworkManager } = require("./utils/network");

  const manager = new NetworkManager();

(async () => {
  await manager.bootstrap(2,1);
  console.log("STARTING");
  await manager.start();
})();
