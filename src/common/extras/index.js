const Downloader = require("../utils/downloader");

function getOsInfo() {
  let platform;
  let arch;
  switch (process.platform) {
    case "win32":
      platform = "windows";
      break;
    case "darwin":
      platform = "mac";
      break;
    default:
      // linux, windows, and mac, so default to linux just to have something
      // for the install to try
      platform = "linux";
      break;
  }
  switch (process.arch) {
    case "x64":
      arch = "x64";
      break;
    default:
      // we only support x64 and x32. so just default to x32 just to have something
      // for the install to try
      arch = "x32";
      break;
  }
  return {
    platform, arch
  }
}

module.exports = {
  init: (path) => {
    const releaseUrl = "https://github.com/trufflesuite/ganache-flavors/releases/download/0.0.1/";
    const downloader = new Downloader(path);
    class File {
      constructor(name) {
        this.name = name;
        this.url = releaseUrl + name;
      }
      async download() {
        return downloader.download(this.url);
      }
    }
    const os = getOsInfo();
    const platform = os.platform;
    const arch = os.arch;
    const extras = {
      downloader: downloader,
      corda: {
        downloadAll: async (force = false) => {
          const keys = Object.values(extras.corda.files).map(file => file.url);
          const pathPromises = downloader.downloadAll(keys, force);
          return pathPromises.then((paths) => {
            const result = {};
            keys.forEach((key, i) => result[key] = paths[i]);
            return result;
          })
        },
        files: {
          cordaBoostrapper: new File(`corda-tools-network-bootstrapper-4.3.jar`),
          braidServer: new File(`braid-server.jar`),
          blobInspector: new File(`corda-tools-blob-inspector-4.3.jar`),
          postgres: new File(`postgresql-9.6.15-2-${platform}-${arch}-binaries.zip`),
          jre: new File(`OpenJDK8U-jre_${arch}_${platform}_hotspot_8u232b09.zip`)
        }
      }
    }
    return extras;
  }
};
