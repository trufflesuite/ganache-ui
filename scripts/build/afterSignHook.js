// See: https://medium.com/@TwitterArchiveEraser/notarize-electron-apps-7a5f988406db

const fs = require('fs');
const path = require('path');
const electron_notarize = require('@electron/notarize');
const pkg = require("../../package.json");

module.exports = async function (params) {
    // Only notarize the app on Mac OS only.
    if (process.platform !== 'darwin' || process.env.NOTARIZE !== 'true') {
        return;
    }
    console.log('afterSign hook triggered', params);

    // Same appId in electron-builder.
    let appId = pkg.build.appId;

    let appPath = path.join(params.appOutDir, `${params.packager.appInfo.productFilename}.app`);
    if (!fs.existsSync(appPath)) {
        throw new Error(`Cannot find application at: ${appPath}`);
    }

    console.log(`Notarizing ${appId} found at ${appPath}`);

    const interval = setInterval(() => {
        console.log("...");
    }, 10000);

    try {
        await electron_notarize.notarize({
            tool: "notarytool",
            appBundleId: appId,
            appPath: appPath,
            teamId: process.env.appleTeamId,
            appleId: process.env.appleId,
            appleIdPassword: process.env.appleIdPassword
        });
    } catch (error) {
        console.error(`Notarization failed. Some reasons this might happen:`);
        console.error(`  * wrong credentials`);
        console.error(`  * Apple is blocking it due to a new Apple Developer License Agreement; is so, you'll need the Team admin to login to  https://developer.apple.com to accept it.`);
        console.error(`  * Apple changed something again (you're on your own here)`);
        console.error(` `);
        console.error(`Error:`);
        console.error(error);
        throw error;
    } finally {
        clearInterval(interval);
    }

    console.log(`Done notarizing ${appId}`);
};