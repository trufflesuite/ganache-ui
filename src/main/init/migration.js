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

  const uninstallOldGanache = async (pattern) => {
    const isInstalled = await new Promise((resolve, reject) => {
      exec(`powershell.exe Get-AppxPackage ${pattern}`, (error, stdout) => {
        if (error) {
          return reject(error);
        }

        // The output should be an empty string if no package matches, but to
        // guard against changes, let's just check that the `Name` label exists.
        const isMatch = stdout.indexOf("Name") != -1;

        resolve(isMatch);
      });
    });

    if (isInstalled) {
      await new Promise((resolve, reject) => { 
        const proc = exec(`powershell.exe Start-Process -Verb runAs powershell -argumentList '\\"Get-AppxPackage ${pattern} | Remove-AppxPackage\\"'`);

        proc.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Attempting to uninstall old versions failed.\nExited with code ${code}`));
          }
        })
        .on("error", (err) => reject(err));
      });
    }
  };

  uninstallOld = () => {
    // In Ganache 2.3.0 the signing certificate was changed from `CN="Truffle
    // Blockchain Group, Inc", O="Truffle Blockchain Group, Inc", L=Yakima,
    // S=Washington, C=US.` to `CN=Consensys Software Inc., O=Consensys Software
    // Inc., L=Brooklyn, S=New York, C=US`. As a workaround, the application
    // name was changed to `GanacheUI` (allowing the two versions to be
    // installed in parallel).

    // In Ganache 2.7.0 the signing certificate was changed again to
    // "CN=Consensys Software Inc., O=Consensys Software Inc., L=Brooklyn, S=New
    // York, C=US". The application name was _not_ changed - Windows 11 supports
    // installing both in parallel, and previous versions will give a reasonably
    // helpful message.
    
    // In order to target versions < 2.3.0, we can simply filter by `-Name
    // Ganache`.
    
    // In order to target versions >= 2.3.0 < 2.7.0, must filter by `-Name
    // GanacheUI` and `Publisher` (as >= 2.7.0 will match the `-Name GanacheUI`
    // filter).

    return Promise.all([
      uninstallOldGanache('-Name Ganache'),
      uninstallOldGanache('-Name GanacheUI -Publisher *Truffle*')
    ]);
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
