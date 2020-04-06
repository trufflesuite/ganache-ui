/* global __static:readonly */

const { spawn } = require("promisify-child-process");
import path from "path";
import * as os from "os";
import merge from "lodash.merge";
import ethagen from "ethagen/wallet";
import moniker from "moniker";
import fixPath from "fix-path"
import { format as formatUrl } from 'url';
import {
  app,
  BrowserWindow,
  Menu,
  shell,
  ipcMain,
  screen,
  clipboard,
} from "electron"
import { initAutoUpdates, getAutoUpdateService } from "./init/AutoUpdate.js";
import {
  REQUEST_SERVER_RESTART,
  SET_SERVER_STARTED,
  SET_SYSTEM_ERROR,
  SHOW_HOME_SCREEN,
  SET_PROGRESS,
} from "../common/redux/core/actions";
import {
  SET_WORKSPACES,
  OPEN_WORKSPACE,
  CLOSE_WORKSPACE,
  DELETE_WORKSPACE,
  SET_CURRENT_WORKSPACE,
  OPEN_NEW_WORKSPACE_CONFIG,
  OPEN_WORKSPACE_CONFIG,
  DOWNLOAD_EXTRAS,
} from "../common/redux/workspaces/actions";
import {
  SET_SETTINGS,
  REQUEST_SAVE_SETTINGS,
  STARTUP_MODE,
} from "../common/redux/config/actions";
import { SET_INTERFACES } from "../common/redux/network/actions";
import { ADD_LOG_LINES } from "../common/redux/logs/actions";
import GlobalSettings from "./types/settings/GlobalSettings";
import GoogleAnalyticsService from "../common/services/GoogleAnalyticsService";
import IntegrationManager from "../integrations/index.js";
import pojofyError from "../common/utils/pojofyError";
import migration from "./init/migration.js";

const isDevMode = process.execPath.match(/[\\/]electron/) !== null;
const isDevelopment = process.env.NODE_ENV !== 'production';

let mainWindow = null;
const { default: installExtension, REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');

process.on("uncaughtException", err => {
  if (mainWindow && err) {
    mainWindow.webContents.send(SET_SYSTEM_ERROR, err.stack || err);
  }
});

process.on("unhandledRejection", err => {
  if (mainWindow && err) {
    mainWindow.webContents.send(SET_SYSTEM_ERROR, err.stack || err);
  }
})

app.name = "Ganache";
app.allowRendererProcessReuse = true;
if (isDevMode) {
  // electron can't get the version from our package.json when
  // launched via `webpack-electron dev`. This makes electron-updater
  // throw because the app version is "0.0".
  const version = require("../../package.json").version;
  app.getVersion = () => version;
}

const USERDATA_PATH = app.getPath("userData");
let migrationPromise;

if (process.platform === "win32") {
  // APPX packages use virtualized directories unless a real directory already exists at the same location.
  // The virtualized directories don't permit running things like postgres.exe and java.exe in them because
  // these applications use the the directory they're under to run other processes... and that directory doesn't
  // actually exist on disk.
  // So we we do here is create the REAL directory (if it doesn't exist already) so the appx will use it.
  // We launch `cmd.exe` and then run (`/c` switch) `mkdir USERDATA_PATH` from it's context instead of our appx
  // context.
  // eslint-disable-next-line no-console
  let userDataPromise = spawn("cmd.exe", ["/c", "mkdir", USERDATA_PATH]).catch(e => { console.error(e) });

  // start a migration, if needed
  migrationPromise = userDataPromise.then(() => migration.migrate(USERDATA_PATH));
  migrationPromise.then(() => {
    migration.uninstallOld();
  }).catch(e => {
    if (mainWindow) {
      mainWindow.webContents.send(SET_SYSTEM_ERROR, e.stack || e);
    } else {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  });
} else {
  migrationPromise = Promise.resolve();

  // https://github.com/sindresorhus/fix-path
  // GUI apps on macOS don't inherit the $PATH defined in your dotfiles (.bashrc/.bash_profile/.zshrc/etc)
  // i.e. opening app by clicking on icon in Finder, applications list screen
  // $PATH will be defined if you run from terminal (even in production) e.g: . /Applications/Ganache.app/Contents/MacOS/Ganache
  if (process.platform === "darwin") {
    fixPath();
    app.dock.setIcon(getIconPath());
  }
}

const performShutdownTasks = async (integrations) => {
  // don't quit the app before the updater can do its thing
  const service = getAutoUpdateService();
  if (service == null || !service.isRestartingForUpdate) {
    mainWindow = null;

    await integrations.stopChain();
    app.quit();
  }
};

function addLogLines(data, context = undefined) {
  // `mainWindow` can be null/undefined here if the process is killed
  // (common when developing)
  if (mainWindow) {
    mainWindow.webContents.send(ADD_LOG_LINES, data.toString().split(/\n/g), context);
  } else {
    // eslint-disable-next-line no-console
    console.error(data.toString());
  }
}

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  const global = new GlobalSettings(path.join(USERDATA_PATH, "global"));
  const GoogleAnalytics = new GoogleAnalyticsService();

  const integrations = new IntegrationManager(USERDATA_PATH, ipcMain, isDevMode);
  // allow interations to communicate with the mainWindow by emitting a 
  // `"send"` event
  integrations.on("send", function(){
    if (mainWindow) {
      const webContents = mainWindow.webContents;
      if (webContents) {
        webContents.send.apply(webContents, arguments);
      }
    }
  });
  integrations.on("progress", function(message, minDuration = null) {
    mainWindow.webContents.send(SET_PROGRESS, message, minDuration);
    addLogLines(message + "\n");
  });
  
  const workspaceManager = integrations.workspaceManager;
  let workspace;
  let startupMode = STARTUP_MODE.NORMAL;

  app.on(
    "window-all-closed",
    async () => await performShutdownTasks(integrations),
  );

  // Mac: event emitted by closing app from dock
  app.on(
    "will-quit",
    async () => await performShutdownTasks(integrations),
  );

  const width = screen.getPrimaryDisplay().bounds.width;
  const standardWidth = 1200;
  const standardHeight = 800;
  const standardAspectRation = standardWidth / standardHeight;
  let appWidth = Math.min(standardWidth, width * 0.9);
  const appHeight = Math.min(800, (1 / standardAspectRation) * appWidth);
  appWidth = standardAspectRation * appHeight;

  Menu.setApplicationMenu(null)

  app.commandLine.appendSwitch("ignore-certificate-errors", "true");
  
  app.on('certificate-error', (event, _webContents, _url, _error, _certificate, callback) => {
    // On certificate error we disable default behaviour (stop loading the page)
    // and we then say "it is all fine - true" to the callback
    event.preventDefault();
    callback(true);
});

  mainWindow = new BrowserWindow({
    show: false,
    minWidth: 950,
    minHeight: 670,
    width: appWidth,
    height: appHeight,
    frame: true,
    icon: getIconPath(),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule:true
    }
  });

  // Open the DevTools.
  if (isDevMode) {
    installExtension(REACT_DEVELOPER_TOOLS).then(() => {
      installExtension(REDUX_DEVTOOLS).then(() => {
        mainWindow.webContents.openDevTools();
      });
    });
  }

  if (isDevelopment) {
    mainWindow.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
  } else {
    mainWindow.loadURL(formatUrl({
      pathname: path.join(__dirname, "index.html"),
      protocol: 'file',
      slashes: true
    }));
  }

  mainWindow.on("closed", () => mainWindow = null);

  // we can't get our app settings until the migrate is complete...
  const bootstrapPromise = migrationPromise.then(() => {
    global.bootstrap();
    workspaceManager.bootstrap();
  });

  // if a user clicks a link to an external webpage, open it in the user's browser, not our app
  mainWindow.webContents.on("new-window", ensureExternalLinksAreOpenedInBrowser);
  mainWindow.webContents.on("will-navigate",ensureExternalLinksAreOpenedInBrowser);

  // handle right click:
  mainWindow.webContents.on("context-menu", (_e, props) => {
    const { x, y, isEditable, selectionText } = props;
    const hasText = selectionText.length !== 0;
    const template = [];
    if (isEditable) {
      template.push({
        label: "Cut",
        accelerator: "CmdOrCtrl+X",
        selector: "cut:",
        enabled: hasText,
        click() {
          clipboard.writeText(selectionText);
          mainWindow.webContents.delete();
        },
      });
    }

    if (hasText || isEditable) {
      template.push({
        label: "Copy",
        accelerator: "CmdOrCtrl+C",
        selector: "copy:",
        enabled: hasText,
        click() {
          clipboard.writeText(selectionText);
        },
      });
    }

    if (isEditable) {
      template.push({
        label: "Paste",
        accelerator: "CmdOrCtrl+V",
        selector: "paste:",
        enabled: clipboard.readText().length > 0,
        click() {
          let clipboardContent = clipboard.readText();
          mainWindow.webContents.insertText(clipboardContent);
        },
      });
    }

    // add a "Search Google for" context menu when the text is Googleable.
    const printableText = selectionText.replace(/[^ -~]+/g, " ").trim();
    if (printableText.length > 0) {
      let trimmedText = printableText;
      if (trimmedText.length > 50) {
        trimmedText = trimmedText.substring(0, 60);
        const lastWordIndex = trimmedText.lastIndexOf(" ");
        if (lastWordIndex !== -1) {
          trimmedText = trimmedText.substring(0, lastWordIndex) + "…";
        }
      }
      if (template.length > 2) {
        template.push({ type: "separator" });
      }
      template.push({
        label: `Search Google for “${trimmedText}”`,
        click: () => {
          shell.openExternal(
            `https://www.google.com/search?q=${encodeURIComponent(
              printableText,
            )}`,
          );
        },
      });
    }

    if (template.length) {
      template.push({ type: "separator" });
    }

    template.push({
      label: "Inspect",
      click() {
        mainWindow.inspectElement(x, y);
      },
    });

    Menu.buildFromTemplate(template).popup(mainWindow);
  });

  mainWindow.webContents.on("did-finish-load", didfinishLoad);

  async function didfinishLoad() {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.setTitle("Ganache");

    // We need to wait until we have finished our migration before
    // getting and then sending our settings and workspaces...
    bootstrapPromise.then(() => {
      // make sure the store registers the settings ASAP in the event of a startup crash
      const globalSettings = global.getAll();
      mainWindow.webContents.send(SET_SETTINGS, globalSettings, {});

      mainWindow.webContents.send(
        SET_WORKSPACES,
        workspaceManager.getNonDefaultNames(),
      );

      initAutoUpdates(globalSettings, mainWindow);
    });

    integrations.on("start-error", err => {
      err.code = "CUSTOMERROR";
      err.key = "workspace.server.chain";
      err.value = err.message + "\n\n" + err.stack;
      err.tab = "server";

      mainWindow.webContents.send(SET_SYSTEM_ERROR, err);
    });

    integrations.on("server-started", () => {
      if (workspace) {
        const globalSettings = global.getAll();
        const workspaceSettings = workspace.settings.getAll();
        mainWindow.webContents.send(
          SET_SERVER_STARTED,
          globalSettings,
          workspaceSettings,
          startupMode,
        );
        mainWindow.webContents.send(
          SET_SETTINGS,
          globalSettings,
          workspaceSettings,
        );
      }
    });

    integrations.on("stdout", addLogLines);
    integrations.on("stderr", addLogLines);
    integrations.on("error", async _error => {
      let error = pojofyError(_error);
      mainWindow.webContents.send(SET_SYSTEM_ERROR, error);

      await integrations.stopServer();
    });
  }


  ipcMain.on(DOWNLOAD_EXTRAS, async (event, flavor) => {
    if (integrations.config[flavor]) {
      const extras = integrations.config[flavor];
      mainWindow.webContents.send(DOWNLOAD_EXTRAS, {
        status: "downloading",
        flavor
      });
      try {
        await extras.downloadRequired(true);
        mainWindow.webContents.send(DOWNLOAD_EXTRAS, {
          status: "success",
          flavor
        });
      } catch (e) {
        mainWindow.webContents.send(DOWNLOAD_EXTRAS, {
          status: "failed",
          error: e,
          flavor
        });
      }
    } else {
      mainWindow.webContents.send(DOWNLOAD_EXTRAS, {
        status: "failed",
        flavor
      });
    }
  });
  
  ipcMain.on(DELETE_WORKSPACE, async (event, name, flavor) => {
    await integrations.stopServer();

    const tempWorkspace = workspaceManager.get(name, flavor);
    if (tempWorkspace) {
      tempWorkspace.delete();

      workspaceManager.bootstrap();

      mainWindow.webContents.send(
        SET_WORKSPACES,
        workspaceManager.getNonDefaultNames(),
      );
    }
  });

  ipcMain.on(CLOSE_WORKSPACE, async () => {
    await integrations.stopServer();

    workspaceManager.bootstrap();

    const globalSettings = global.getAll();
    mainWindow.webContents.send(SET_SETTINGS, globalSettings, {});

    mainWindow.webContents.send(
      SET_WORKSPACES,
      workspaceManager.getNonDefaultNames(),
    );

    mainWindow.webContents.send(SHOW_HOME_SCREEN);
  });

  ipcMain.on(OPEN_WORKSPACE, async (event, name, flavor = "ethereum") => {
    await integrations.stopServer();

    await integrations.setWorkspace(name, flavor);
    workspace = integrations.workspace;

    global.set("last_flavor", flavor);

    const workspaceSettings = workspace.settings.getAll();
    GoogleAnalytics.setup(
      global.get("googleAnalyticsTracking") && !isDevMode,
      workspaceSettings.uuid,
    );
    GoogleAnalytics.reportGenericUserData();
    GoogleAnalytics.reportWorkspaceSettings(workspaceSettings);

    let projects = [];
    if (workspace.name === null) {
      // default workspace shouldn't have pre-existing projects
      // this logic only should get called when the user presses
      // the default workspace button. the restart after loading
      // the projects should trigger the REQUEST_SERVER_RESTART
      // logic
      workspace.settings.set("projects", []);
    } else {
      for (let i = 0; i < workspaceSettings.projects.length; i++) {
        projects.push(
          await integrations.flavor.projectIntegration.getProjectDetails(
            workspaceSettings.projects[i],
            workspaceSettings.server ? workspaceSettings.server.network_id : null,
          ),
        );
      }
    }

    let tempWorkspace = {};
    merge(tempWorkspace, { projects }, workspace);
    delete tempWorkspace.contractCache;
    delete tempWorkspace.settings;

    mainWindow.webContents.send(
      SET_CURRENT_WORKSPACE,
      tempWorkspace,
      workspace.contractCache.getAll(),
    );

    const globalSettings = global.getAll();
    mainWindow.webContents.send(
      SET_SETTINGS,
      globalSettings,
      workspace.settings.getAll(),
    );

    startupMode = STARTUP_MODE.NORMAL;
    if (await integrations.startServer()){
      // this sends the network interfaces to the renderer process for
      //  enumering in the config screen. it sends repeatedly
      continuouslySendNetworkInterfaces();
    }
  });

  ipcMain.on(OPEN_NEW_WORKSPACE_CONFIG, async (_event, flavor = "ethereum") => {
    ipcMain.emit(OPEN_WORKSPACE_CONFIG, _event, null, flavor);
  });

  ipcMain.on(OPEN_WORKSPACE_CONFIG, async (_event, workspaceName, flavor) => {
    await integrations.stopServer();

    global.set("last_flavor", flavor);

    startupMode = workspaceName ? STARTUP_MODE.EDIT_WORKSPACE : STARTUP_MODE.NEW_WORKSPACE;
    const defaultWorkspace = workspaceManager.get(workspaceName || null, flavor);
    if (!workspaceName) {
      workspaceName = moniker.choose();
    }
    const wallet = new ethagen({ entropyBits: 128 });
    defaultWorkspace.saveAs(
      workspaceName,
      null,
      workspaceManager.directory,
      wallet.mnemonic,
    );

    workspaceManager.bootstrap();

    await integrations.setWorkspace(workspaceName, flavor);
    workspace = integrations.workspace;

    let tempWorkspace = {};
    merge(tempWorkspace, {}, workspace);
    delete tempWorkspace.contractCache;
    delete tempWorkspace.settings;

    mainWindow.webContents.send(
      SET_CURRENT_WORKSPACE,
      tempWorkspace,
      workspace.contractCache.getAll(),
    );

    if (flavor === "ethereum") {
      await integrations.startChain();
      if (!(await integrations.startServer())) {
        return;
      }
    } else {
      if (workspace) {
        const globalSettings = global.getAll();
        const workspaceSettings = workspace.settings.getAll();
        mainWindow.webContents.send(
          SET_SERVER_STARTED,
          globalSettings,
          workspaceSettings,
          startupMode,
        );
      }
    }

    // this sends the network interfaces to the renderer process for
    //  enumering in the config screen. it sends repeatedly
    continuouslySendNetworkInterfaces();

    const globalSettings = global.getAll();

    // make sure we don't start with any projects for new workspaces
    workspace.settings.set("projects", []);

    const workspaceSettings = workspace.settings.getAll();
    mainWindow.webContents.send(
      SET_SETTINGS,
      globalSettings,
      workspaceSettings,
    );

    mainWindow.webContents.send(
      SET_WORKSPACES,
      workspaceManager.getNonDefaultNames(),
    );
  });

  // If the frontend asks to start the server, start the server.
  // This will trigger then chain event handlers above once the server stops.
  ipcMain.on(REQUEST_SERVER_RESTART, async () => {
    // make sure the store registers the settings ASAP in the event of a startup crash
    const globalSettings = global.getAll();
    mainWindow.webContents.send(SET_SETTINGS, globalSettings, {});

    if (workspace) {
      await integrations.stopServer();

      if (startupMode === STARTUP_MODE.NEW_WORKSPACE) {
        // we just made a new workspace. we need to reset the chaindata since we initialized it
        // when started the configuration process
        workspace.resetChaindata();
      }

      const workspaceSettings = workspace.settings.getAll();

      let projects = [];
      for (let i = 0; i < workspaceSettings.projects.length; i++) {
        projects.push(
          await integrations.flavor.projectIntegration.getProjectDetails(
            workspaceSettings.projects[i],
            workspaceSettings.server ? workspaceSettings.server.network_id : null,
          ),
        );
      }

      let tempWorkspace = {};
      merge(tempWorkspace, { projects }, workspace);
      delete tempWorkspace.contractCache;
      delete tempWorkspace.settings;

      mainWindow.webContents.send(
        SET_WORKSPACES,
        workspaceManager.getNonDefaultNames(),
      );
      mainWindow.webContents.send(
        SET_CURRENT_WORKSPACE,
        tempWorkspace,
        workspace.contractCache.getAll(),
      );

      const globalSettings = global.getAll();
      mainWindow.webContents.send(
        SET_SETTINGS,
        globalSettings,
        workspaceSettings,
      );

      startupMode = STARTUP_MODE.NORMAL;

      if (await integrations.startServer()){
        // send the interfaces again once on restart
        sendNetworkInterfaces();
      }
    }
  });

  ipcMain.on(
    REQUEST_SAVE_SETTINGS,
    async (event, globalSettings, workspaceSettings) => {
      global.setAll(globalSettings);

      if (workspace && workspaceSettings) {
        workspace.settings.setAll(workspaceSettings);
      }

      GoogleAnalytics.reportWorkspaceSettings(workspaceSettings);
    },
  );
});

// Do this every 2 minutes to keep it up to date without
//   being unreasonable since it shouldn't change frequently
let networkInterfacesIntervalId = null;
function continuouslySendNetworkInterfaces() {
  sendNetworkInterfaces();

  if (networkInterfacesIntervalId === null) {
    networkInterfacesIntervalId = setInterval(() => {
      sendNetworkInterfaces();
    }, 2 * 60 * 1000);
  }
}

function sendNetworkInterfaces() {
  // Send the network interfaces to the renderer process
  const interfaces = os.networkInterfaces();

  if (mainWindow) {
    mainWindow.webContents.send(SET_INTERFACES, interfaces);
  }
}

function ensureExternalLinksAreOpenedInBrowser(event, url) {
  // we're a one-window application, and we only ever want to load external
  // resources in the user's browser, not via a new browser window
  if (url.startsWith("http:") || url.startsWith("https:")) {
    shell.openExternal(url);
    event.preventDefault();
  }
}

function getIconPath() {
  return process.platform === "win32"
    ? path.resolve(__static, "icons/win/icon.ico") // Windows, use an icon
    : path.resolve(__static, "icons/png/256x256.png"); // Mac & Linux, use an image
}
