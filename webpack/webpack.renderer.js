const path = require("path");

const babelLoader = {
  loader: "babel-loader",
  options: {
    cacheDirectory: true,
    cacheCompression: false
  }
};

module.exports = function(config) {
  const rootDir = path.resolve(__dirname, "../");
  const srcDir = path.resolve(rootDir, "src")
  const rules = config.module.rules;
  // we don't want to url-encode svgs, so remove the svgs from the image rule
  const imageRule = rules.find(rule => {
    return rule.test.toString() === "/\\.(png|jpe?g|gif|svg)(\\?.*)?$/";
  });

  // override its test
  imageRule.test = /\.(png|jpe?g|gif)(\?.*)?$/i;
  imageRule.include = [
    srcDir,
    path.resolve(rootDir, "static")
  ];
  imageRule.use = [
    "cache-loader",
    imageRule.use
  ];

  // add our custom rules
  rules.push.apply(rules, [
    {
      test: /\.(js|jsx)$/i,
      include: srcDir,
      use: [
        {
          loader: "babel-loader",
          options: {
            ...babelLoader.options,
            presets: ["@babel/react"]
          }
        }
      ],
    },
    {
      test: /\.svg$/i,
      include: path.resolve(srcDir, "renderer", "icons"),
      use: [
        babelLoader,
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
  config.resolve.alias["@static"] = path.resolve(__dirname, '../static');

  config.resolve.symlinks = false;
  config.output.pathinfo = false;

  return config;
};
