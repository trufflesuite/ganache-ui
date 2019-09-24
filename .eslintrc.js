module.exports = {
  extends: ["prettier", "eslint:recommended", "plugin:react/recommended"],
  plugins: ["prettier", "react", "jest"],
  rules: {
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
