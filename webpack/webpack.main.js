module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "shebang-loader"
      }
    ]
  },
  resolve: {
    alias: {
      "scrypt": "js-scrypt"
    }
  }
};
