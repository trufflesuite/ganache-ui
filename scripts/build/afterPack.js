const { join } = require("path");
const { chmodSync, readFileSync, writeFileSync } = require("fs-extra");

const afterPack = async (context) => {
    if (context.electronPlatformName !== "linux") {
        return;
    }
    if (context.targets.length !== 1) {
        throw new Error("Linux can only target 1 build at a time.");
    }
    const target = context.targets[0];
    if (target.name !== "appImage") {
        throw new Error("I don't know if this will work with other linux targets. You'll need to test before removing this check!");
    }

    const appRunTemplate = readFileSync(join(__dirname, "AppRun"), {encoding: "utf-8"});
    const appRunFinal = appRunTemplate.replace(/{APP_NAME}/g, target.options.executableName);
    const appRunPath = join(context.appOutDir, "AppRun")
    writeFileSync(appRunPath, appRunFinal, {encoding: "utf-8"});
    // make sure this file is executable
    chmodSync(appRunPath, 0o755);
};

module.exports = afterPack;
