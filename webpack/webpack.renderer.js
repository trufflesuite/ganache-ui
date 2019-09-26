const path = require("path");

module.exports = function(config) {
  // we don't want to url-encode svgs, so remove thesvgs from the image rule
  const imageRule = config.module.rules.find(rule => {
    return rule.test.toString() === "/\\.(png|jpe?g|gif|svg)(\\?.*)?$/";
  });

  // override its test
  imageRule.test = /\.(png|jpe?g|gif)(\?.*)?$/;

  // add our custom rules
  config.module.rules.push.apply(config.module.rules, [
    {
      test: /\.(js|jsx)$/,
      loader: "babel-loader",
      options: {
        presets: ["@babel/react"]
      },
    },
    {
      test: /\.svg$/,
      use: [
        "babel-loader",
        {
          loader: "react-svg-loader",
          options: {
            svgo: {
              plugins: [
                {
                  removeViewBox: false
                }
              ]
            }
          }
        }
      ]
    }
  ]);

  // Enable referencing our static assets in css/scss:
  if (!config.resolve) {
    config.resolve = {};
  }
  config.resolve.alias["@static"] = path.resolve ( __dirname, '../static' );

  return config;
};
