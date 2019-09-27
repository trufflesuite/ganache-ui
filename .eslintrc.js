module.exports = {
  extends: ["prettier", "eslint:recommended", "plugin:react/recommended"],
  plugins: ["prettier", "react", "jest", "react-hooks"],
  rules: {
    "no-console": "warn",
    "react/prop-types": 0,
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  },
  parserOptions: {
    "ecmaVersion": 8,
    "sourceType": "module"
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
