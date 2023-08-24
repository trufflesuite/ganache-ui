module.exports = {
  output: {
    hashFunction: "sha256",
  },
  resolve: {
    alias: {
      "scrypt": "js-scrypt"
    }
  },
  externals: ["@ganache/filecoin"]
};
