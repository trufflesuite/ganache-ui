const { Extract } = require("unzip-stream");
const { get } = require("follow-redirects/https");
const URL = require("url");
const { join, parse } = require("path");
const { existsSync, createWriteStream, unlink } = require("fs");

function parseUrl(urlString){
  const parsed = URL.parse(urlString);
  return parse(parsed.pathname);
}

class Downloader {
  constructor(saveLocation) {
    this.saveLocation = saveLocation;
  }
  /**
   * Downloads the resource to the saveLocation, using the file
   * @param {string} url The URL of the resource to download
   */
  download(url, force = false) {
    const parsedUri = parseUrl(url);
    const isZip = parsedUri.ext.toLowerCase() === ".zip";
    const dest = join(this.saveLocation, isZip ? parsedUri.name : parsedUri.base);
    // if the file/folder already exists don't download it again unless we are `force`d to
    if (!force && existsSync(dest)){
      return Promise.resolve(dest);
    }
    const fn = isZip ? this.unzip : this.save;
    return new Promise((resolve, reject) => {
      get(url, (response) => {
        if (response.statusCode !== 200) {
          return reject("Response status was " + response.statusCode);
        }

        fn(response, dest).then(() => resolve(dest));
      }).on("error", err => {
        unlink(dest);
        reject(err);
      });
    });
  }
  save(stream, dest) {
    const file = createWriteStream(dest);
    stream.pipe(file);
    return new Promise((resolve, reject) => {
      file.on("finish", () => {
        file.close(resolve);
      }).on("error", reject);
    });
  }
  unzip(stream, path) {
    return new Promise((resolve, reject) => {
      stream.pipe(Extract({ path }))
        .on("close", resolve)
        .on("error", reject);
    });
  }
  downloadAll(urls) {
    return Promise.all(urls.map(this.download.bind(this)));
  }
}

module.exports = Downloader;
