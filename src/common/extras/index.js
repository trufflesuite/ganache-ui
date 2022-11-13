const Downloader = require("../utils/downloader");

module.exports = {
  init: (path) => {
    const downloader = new Downloader(path);
    return {
      downloader,
    };
  },
};
