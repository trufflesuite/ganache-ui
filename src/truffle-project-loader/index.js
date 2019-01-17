const fs = require("fs");
const path = require("path");

if (process.argv.length < 3) {
  throw new Error(
    `The truffle-project-loader process requires atleast 3 arguments, received ${
      process.argv.length
    }.`,
  );
}

const projectFile = process.argv[2];

const configFileDirectory = path.dirname(projectFile);
const name = path.basename(configFileDirectory);
if (!fs.existsSync(projectFile)) {
  process.send({
    name,
    configFile: projectFile,
    error: "project-does-not-exist",
  });
} else if (
  path.basename(projectFile).match(/^truffle(-config)?.js$/) === null
) {
  process.send({
    name,
    configFile: projectFile,
    error: "invalid-project-file",
  });
} else {
  const output = require(projectFile);

  process.send(output);
}
