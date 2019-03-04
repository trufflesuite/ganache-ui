const babelOptions = {
  presets: ["env", "stage-0", "react"],
  plugins: [
    "transform-class-properties",
    "transform-async-to-generator",
    "transform-es2015-classes",
  ],
};

module.exports = require("babel-jest").createTransformer(babelOptions);
