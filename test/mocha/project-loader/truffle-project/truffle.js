//make sure we execute the config file at the proper `cwd`:
// by attempting to read a local file:
const json = JSON.parse(require("fs").readFileSync("./myfile.json", "utf-8"));

// make sure we don't throw if something is logged to console.error:
// eslint-disable-next-line no-console
console.error("Just a friendly error message. Don't be alarmed.");

// make sure we can handle circular json in the project file:
const circles = {};
circles.circles = circles;
module.exports = {
  networks: {
    provider: circles,
  },
  otherThings: 123,
  build_directory: json.dir,
};
