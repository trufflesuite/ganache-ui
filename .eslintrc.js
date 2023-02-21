module.exports = {
  extends: ["prettier", "eslint:recommended", "plugin:react/recommended"],
  plugins: ["prettier", "react", "jest", "react-hooks"],
  rules: {
    "no-prototype-builtins": "warn",
    "no-console": "warn",
    "react/prop-types": 0,
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  env: {
    es6: true,
    browser: true,
    node: true,
    mocha: true,
    "jest/globals": true,
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  parser: "babel-eslint",
};
