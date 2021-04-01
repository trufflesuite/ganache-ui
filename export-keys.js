const fs = require("fs");
const path = require("path");

fs.writeFileSync(
  path.join(__dirname, "exported-keys.txt"),
  process.argv.join("\n")
);
