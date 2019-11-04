const generate = require(".");
// const conf = require("./utils/config/templates/node.json");
const { createWriteStream } = require("fs");
const conf = require("./templates/notary.json");
const {port} = require("../network");

const stream = createWriteStream("test.conf");

generate(conf, { port: port(10009), write: (val) => stream.write(`${val}\n`, "utf8") });

stream.end();
