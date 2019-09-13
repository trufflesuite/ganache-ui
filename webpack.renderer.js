module.exports = function(config) {
    // find the rule
    const imageRule = config.module.rules.find(rule =>{
        return rule.test.toString() === '/\\.(png|jpe?g|gif|svg)(\\?.*)?$/'
    });

    // override its test
    imageRule.test = /\.(png|jpe?g|gif)(\?.*)?$/
    // add your extra rule
    config.module.rules.push.apply(config.module.rules, [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        options: {
          presets: ["@babel/react"]
        }
      },
      {
        test: /\.svg$/,
        use: [
          "babel-loader",
          {
            loader: "react-svg-loader",
            options: {
              svgo: {
                plugins: [{
                  removeTitle: false
                }],
                floatPrecision: 2
              }
            }
          }
        ]
      }
    ]);
    // finally return the modified config
    return config;
}
