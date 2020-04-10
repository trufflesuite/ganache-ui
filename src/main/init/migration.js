import { join } from "path";
import { copy, pathExists as exists, readdir } from "fs-extra";
import { exec } from "child_process";
import * as pkg from "../../../package.json";

let migrate, uninstallOld;
if (process.platform == "win32") {
  const APP_DATA = process.env.APPDATA;
  const COPY_SETTINGS = {
    preserveTimestamps: true
  };

  const moveGlobalSettings = async (oldGanache, newGanache) => {
    const oldSettingsPath = join(oldGanache, "global", "Settings");
    const settingsExists = await exists(oldSettingsPath);
    if (!settingsExists) return;

    const newSettingsPath = join(newGanache, "global", "Settings");
    const copyPromise = copy(oldSettingsPath, newSettingsPath, COPY_SETTINGS);
    return copyPromise;
  }

  const moveWorkspaces = async (oldGanache, newGanache) => {
    const oldWorkspacesPath = join(oldGanache, "workspaces");
    const workspaceExists = await exists(oldWorkspacesPath);
    if (!workspaceExists) return;

    const newWorkspacesPath = join(newGanache, "workspaces");
    const dirs = await readdir(oldWorkspacesPath, { withFileTypes: true });
    const promises = [];
    dirs.forEach(dirent => {
      if (!dirent.isDirectory()) return;
      const dirName = dirent.name;
      const oldPath = join(oldWorkspacesPath, dirName);
      const newPath = join(newWorkspacesPath, dirName);
      const copyPromise = copy(oldPath, newPath, COPY_SETTINGS);
      promises.push(copyPromise);
    });

    await Promise.all(promises);
  }

  const getOldGanachePath = ()=>{
    return join(APP_DATA, "/../Local/Packages/Ganache_zh355ej5cj694/LocalCache/Roaming/Ganache");
  }

  const ganacheExists = () => {
    return exists(getOldGanachePath());
  }

  /**
   * When we switched from Consensys code signing certificates to Truffle code 
   * signing certificates we had to change the name of our AppX application so 
   * that Windows would let it install without conflict. This function will move 
   * the old version's workspaces and global settings file over to the new 
   * workspace folder.
   */
  migrate = async (newGanache) => {
    if (!APP_DATA) return;
    const oldGanache = getOldGanachePath();
    
    if (!(await ganacheExists())) return;

    const newGanacheVirtualized = join(APP_DATA, `/../Local/Packages/${pkg.build.appx.identityName}_5dg5pnz03psnj/LocalCache/Roaming/Ganache`);
    return Promise.all([moveWorkspaces(oldGanache, newGanache), moveGlobalSettings(oldGanache, newGanache), moveWorkspaces(newGanacheVirtualized, newGanache), moveGlobalSettings(newGanacheVirtualized, newGanache)]);
  };

  uninstallOld = async () => {
    if (!(await ganacheExists())) return;

    return new Promise((resolve, reject) => {
      try {
        const proc = exec('powershell.exe Start-Process -Verb runAs powershell -argumentList \\"Get-AppxPackage Ganache | Remove-AppxPackage\\"');
        proc.once("close", resolve);
      } catch(e) {
        reject(e);
      }
    });
  }
} else {
  const noop = () => Promise.resolve();
  migrate = uninstallOld = noop;
}

export default {
  migrate,
  uninstallOld
};
