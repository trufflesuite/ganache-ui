const generate = require("./generate");
const conf = require("./templates/node.json");
const { createWriteStream } = require("fs");
// const conf = require("./templates/notary.json");
const {port} = require("../network");

const stream = createWriteStream("test.conf");
// conf.properties['myLegalName'].value = "DAVID MURDOCH";
generate(conf, {
    getPort: port(10009),
    write: (val) => stream.write(`${val}\n`, "utf8"),
    getNonce : ((val) => () => val++)(0),
    postgres: {
        port: 5432,
        schema: "mynode"
    }
});

stream.end();
