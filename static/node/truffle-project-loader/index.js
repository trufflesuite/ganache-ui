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

  // it isn't "safe" to serialize the output itself, as it may have functions and circular dependencies
  // all we actually  need are the following three properties, and I'm type checking them just to be on the safe side.
  process.send({
    truffle_directory:
      typeof output.truffle_directory === "string"
        ? output.truffle_directory
        : undefined,
    build_directory:
      typeof output.build_directory === "string"
        ? output.build_directory
        : undefined,
    contracts_build_directory:
      typeof output.contracts_build_directory === "string"
        ? output.contracts_build_directory
        : undefined,
  });
}
