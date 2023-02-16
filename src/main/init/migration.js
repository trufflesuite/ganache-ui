import { join } from "path";
import { copy, pathExists as exists } from "fs-extra";
import { exec } from "child_process";
import * as pkg from "../../../package.json";
import { readdir, symlink, mkdir, readFile } from "fs/promises";

let migrate, uninstallOld;

/*
  When we introduced Ganache 7 for ethereum chains, we moved the workspaces to
  Ganache/ui/workspaces. Previous versions of Ganache-UI would crash loading
  these workspaces, so we link the legacy workspaces to the new workspaces
  directory. This means that the old workspaces are available to both new and
  old versions of Ganache-UI, but new workspaces are only available to new 
  versions.

  See: https://github.com/trufflesuite/ganache-ui/pull/5151
*/
const linkLegacyWorkspaces = async (configRoot) => {
  const legacyWorkspacesDirectory = join(configRoot, "../workspaces");
  const newWorkspacesDirectory = join(configRoot, "workspaces");

  if (!await exists(newWorkspacesDirectory)) {
    await mkdir(newWorkspacesDirectory, { recursive: true })
  }

  if (await exists(legacyWorkspacesDirectory)) {
    const legacyWorkspaces = await readdir(legacyWorkspacesDirectory, { withFileTypes: true });
    const linkingWorkspaces = legacyWorkspaces.map(async legacyWorkspace => {
      try {
        const fullPath = join(legacyWorkspacesDirectory, legacyWorkspace.name);

        const settings = await readFile(join(fullPath, "Settings"));
        const { flavor } = JSON.parse(settings);
        if (flavor === "ethereum" || flavor === "filecoin") {
          // silently ignore any workspaces that aren't of a supported flavor
          const linkPath = join(newWorkspacesDirectory, legacyWorkspace.name);
          if (legacyWorkspace.isDirectory() && !await exists(linkPath)) {
            return symlink(fullPath, linkPath, "junction");
          }
        }
      } catch {
        // silently ignore any workspaces that fail to link
      }
    });

    return Promise.all(linkingWorkspaces);
  }
};


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

  const ganacheRelativeDataPathBefore_2_3_0 = "/../Local/Packages/Ganache_zh355ej5cj694/LocalCache/Roaming/Ganache";
  const ganacheRelativeDataPathBetween_2_3_0__2_7_0 = "/../Local/Packages/GanacheUI_5dg5pnz03psnj";

  const getOldGanacheDataPath = function (relativePath) {
    return join(APP_DATA, relativePath);
  }

  const ganacheExists = (relativePath) => {
    const absolutePath = getOldGanacheDataPath(relativePath);
    return exists(absolutePath);
  }

  /**
   * When we switched from Consensys code signing certificates to Truffle code
   * signing certificates (v.2.3.0) we had to change the name of our AppX
   * application so that Windows would let it install without conflict. This
   * function will move the old version's workspaces and global settings file
   * over to the new workspace folder.
   */
  migrate = async (newGanache) => {
    if (APP_DATA && await ganacheExists(ganacheRelativeDataPathBefore_2_3_0)) {
      const oldGanache = getOldGanacheDataPath(ganacheRelativeDataPathBefore_2_3_0);
      const newGanacheVirtualized = join(APP_DATA, `/../Local/Packages/${pkg.build.appx.identityName}_5dg5pnz03psnj/LocalCache/Roaming/Ganache`);
      await Promise.all([moveWorkspaces(oldGanache, newGanache), moveGlobalSettings(oldGanache, newGanache), moveWorkspaces(newGanacheVirtualized, newGanache), moveGlobalSettings(newGanacheVirtualized, newGanache)]);
    }

    return linkLegacyWorkspaces(newGanache);
  };

  uninstallOld = async () => {
    const removeGanachePromises = [];

    if (ganacheExists(ganacheRelativeDataPathBetween_2_3_0__2_7_0)) {
      // in GanacheUI 2.7 the publisher name was changed from `CN="Truffle
      // Blockchain Group, Inc", O="Truffle Blockchain Group, Inc", L=Yakima,
      // S=Washington, C=US.` to `CN=Consensys Software Inc., O=Consensys
      // Software Inc., L=Brooklyn, S=New York, C=US`.
      //
      // Here we remove versions of GanacheUI >=2.3 and <2.7; (`Name GanacheUI`,
      // with the old publisher name - we must filter by publisher as >= v2.7.0 
      // has the same `Name`.
      const removeGanacheUI_between_2_3_0__2_7_0 = new Promise((resolve, reject) => {
        try {
          // 
          const proc = exec(`powershell.exe Start-Process -Verb runAs powershell -argumentList -- '\\"Get-AppxPackage -Name GanacheUI -Publisher ""*Truffle*"" | Remove-AppxPackage\\"'`);
          proc.once("close", resolve);
        } catch(e) {
          reject(e);
        }
      });
      removeGanachePromises.push(removeGanacheUI_between_2_3_0__2_7_0);
    }

    if (await ganacheExists(ganacheRelativeDataPathBefore_2_3_0)) {
      // Previous to GanacheUI 2.3.0 the application name was `Ganache`. It was
      // renamed to `GanacheUI` to work around the change in publisher name.
      // This removes versions of GanacheUI < 2.3.0 (Name=`Ganache`).
      const removeGanache_before_2_3 = new Promise((resolve, reject) => {
        try {
          const proc = exec('powershell.exe Start-Process -Verb runAs powershell -argumentList \\"Get-AppxPackage Ganache | Remove-AppxPackage\\"');
          proc.once("close", resolve);
        } catch(e) {
          reject(e);
        }
      });
      removeGanachePromises.push(removeGanache_before_2_3);
    }

    return Promise.all(removeGanachePromises);
  }
} else {
  const noop = () => Promise.resolve();
  migrate = linkLegacyWorkspaces;
  uninstallOld = noop;
}

export default {
  migrate,
  uninstallOld
}

// 
