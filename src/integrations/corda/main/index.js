const { network } = require("./utils/");

(async () => {
  await network.bootstrap(2, 1, 10000);
})();
