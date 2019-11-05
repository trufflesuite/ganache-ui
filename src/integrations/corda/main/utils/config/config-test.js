const generate = require("./generate");
// const conf = require("./utils/config/templates/node.json");
const { createWriteStream } = require("fs");
const conf = require("./templates/notary.json");
const {port} = require("../network");

const stream = createWriteStream("test.conf");

generate(conf, {
    getPort: port(10009),
    write: (val) => stream.write(`${val}\n`, "utf8"),
    postgres: {
        port: 5432,
        schema: "mynode"
    }
});

stream.end();
