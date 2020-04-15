
/* IMPORT */

const fixLinuxSandbox = require("./fixLinuxSandbox");

/* AFTER PACK */

async function afterPack({ targets, appOutDir }) {
  await fixLinuxSandbox(targets, appOutDir);
}

/* EXPORT */

module.exports = afterPack;
