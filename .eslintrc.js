module.exports = {
  extends: ["prettier", "eslint:recommended", "plugin:react/recommended"],
  plugins: ["prettier", "react", "jest"],
  parser: "babel-eslint",
  rules: {
    "prettier/prettier": [1, { trailingComma: "all" }],
    "no-console": "warn",
    "react/prop-types": 0
  },
  env: {
    es6: true,
    browser: true,
    node: true,
    mocha: true,
    "jest/globals": true
  },
  settings: {
    react: {
      version: "detect"
    }
  }
};


