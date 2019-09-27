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
import path from "path";
import * as os from "os";
import merge from "lodash.merge";
import ethagen from "ethagen/wallet";
import moniker from "moniker";
import fixPath from "fix-path"
import { format as formatUrl } from 'url';
import {
  REQUEST_SERVER_RESTART,
  SET_SERVER_STARTED,
  SET_KEY_DATA,
  SET_SYSTEM_ERROR,
  SHOW_HOME_SCREEN,
} from "../common/redux/core/actions";

import {
  SHOW_CONFIG_SCREEN,
} from "../common/redux/config/actions";

import {
  SET_WORKSPACES,
  OPEN_WORKSPACE,
  CLOSE_WORKSPACE,
  SAVE_WORKSPACE,
  DELETE_WORKSPACE,
  SET_CURRENT_WORKSPACE,
  CONTRACT_TRANSACTION,
  CONTRACT_EVENT,
  GET_CONTRACT_DETAILS,
  OPEN_NEW_WORKSPACE_CONFIG,
  PROJECT_UPDATED,
} from "../common/redux/workspaces/actions";

import {
  GET_DECODED_EVENT,
  SET_SUBSCRIBED_TOPICS,
} from "../common/redux/events/actions";

import { GET_DECODED_TRANSACTION_INPUT } from "../common/redux/transactions/actions";

import {
  SET_SETTINGS,
  REQUEST_SAVE_SETTINGS,
  STARTUP_MODE,
} from "../common/redux/config/actions";

import { SET_INTERFACES } from "../common/redux/network/actions";

import { ADD_LOG_LINES } from "../common/redux/logs/actions";

import ChainService from "../common/services/ChainService";
import GlobalSettings from "./types/settings/GlobalSettings";
import WorkspaceManager from "./types/workspaces/WorkspaceManager";
import GoogleAnalyticsService from "../common/services/GoogleAnalyticsService";
import TruffleIntegrationService from "../common/services/TruffleIntegrationService.js";

const isDevMode = process.execPath.match(/[\\/]electron/) !== null;
const isDevelopment = process.env.NODE_ENV !== 'production';

let mainWindow = null;

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

app.setName("Ganache");
if (isDevMode) {
  // electron can't get the version from our package.json when
  // launched via `webpack-electron dev`. This makes electron-updater
  // throw because the app version is "0.0".
  const version = require("../../package.json").version;
  app.getVersion = () => version;
}

// https://github.com/sindresorhus/fix-path
// GUI apps on macOS don't inherit the $PATH defined in your dotfiles (.bashrc/.bash_profile/.zshrc/etc)
// i.e. opening app by clicking on icon in Finder, applications list screen
// $PATH will be defined if you run from terminal (even in production) e.g: . /Applications/Ganache.app/Contents/MacOS/Ganache
if (process.platform === "darwin") {
  fixPath();
}
const getIconPath = () => {
  return process.platform === "win32"
    // eslint-disable-next-line
    ? path.resolve(__static, "icons/win/icon.ico") // Windows, use an icon
    // eslint-disable-next-line
    : path.resolve(__static, "icons/png/256x256.png"); // Mac & Linux, use an image
};

if (process.platform === "darwin") {
  app.dock.setIcon(getIconPath());
}

const performShutdownTasks = async ({ truffleIntegration, chain }) => {
  // don't quit the app before the updater can do its thing
  const service = getAutoUpdateService();
  if (service == null || !service.isRestartingForUpdate) {
    mainWindow = null;

    if (truffleIntegration) {
      await truffleIntegration.stopWatching();
    }

    if (chain.isServerStarted()) {
      await chain.stopServer();
    }

    chain.stopProcess();
    truffleIntegration.stopProcess();
    app.quit();
  }
};

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  // workaround for electron race condition, causing hang on startup.
  // see https://github.com/electron/electron/issues/9179 for more info
  setTimeout(async () => {

    const width = screen.getPrimaryDisplay().bounds.width;
    const chain = new ChainService(app);
    const truffleIntegration = new TruffleIntegrationService(isDevMode);
    const global = new GlobalSettings(
      path.join(app.getPath("userData"), "global"),
    );
    const GoogleAnalytics = new GoogleAnalyticsService();
    const workspaceManager = new WorkspaceManager(app.getPath("userData"));
    let workspace;
    let startupMode = STARTUP_MODE.NORMAL;

    app.on(
      "window-all-closed",
      async () => await performShutdownTasks({ truffleIntegration, chain }),
    );

    // Mac: event emitted by closing app from dock
    app.on(
      "will-quit",
      async () => await performShutdownTasks({ truffleIntegration, chain }),
    );

    truffleIntegration.on("error", async error => {
      if (truffleIntegration) {
        await truffleIntegration.stopWatching();
      }

      if (chain.isServerStarted()) {
        // Something wrong happened in the chain, let's try to stop it
        if (mainWindow) {
          mainWindow.webContents.send(SET_SYSTEM_ERROR, error);
        }
        await chain.stopServer();
      } else {
        chain.once("server-started", () => {
          if (mainWindow) {
            mainWindow.webContents.send(SET_SYSTEM_ERROR, error);
          }
        });
      }
    });

    truffleIntegration.on("project-details-update", async data => {
      if (workspace) {
        mainWindow.webContents.send(PROJECT_UPDATED, data.project);
        mainWindow.webContents.send(
          SET_SUBSCRIBED_TOPICS,
          data.subscribedTopics,
        );
      }
    });

    truffleIntegration.on("contract-transaction", data => {
      mainWindow.webContents.send(CONTRACT_TRANSACTION, data);

      if (workspace && workspace.contractCache) {
        workspace.contractCache.addTransaction(
          data.contractAddress,
          data.transactionHash,
        );
      }
    });

    truffleIntegration.on("contract-event", data => {
      mainWindow.webContents.send(CONTRACT_EVENT, data);

      if (workspace && workspace.contractCache) {
        workspace.contractCache.addEvent(data.contractAddress, {
          transactionHash: data.transactionHash,
          logIndex: data.logIndex,
        });
      }
    });

    ipcMain.on(
      GET_CONTRACT_DETAILS,
      async (event, contract, contracts, block) => {
        const state = await truffleIntegration.getContractState(
          contract,
          contracts,
          block,
        );
        mainWindow.webContents.send(GET_CONTRACT_DETAILS, state);
      },
    );

    ipcMain.on(GET_DECODED_EVENT, async (event, contract, contracts, log) => {
      try {
        const decodedLog = await truffleIntegration.getDecodedEvent(
          contract,
          contracts,
          log,
        );
        mainWindow.webContents.send(GET_DECODED_EVENT, decodedLog);
      } catch (e) {
        mainWindow.webContents.send(GET_DECODED_EVENT, {
          error: { stack: e.stack, messages: e.message },
        });
      }
    });

    ipcMain.on(
      GET_DECODED_TRANSACTION_INPUT,
      async (event, contract, contracts, transaction) => {
        try {
          const decodedData = await truffleIntegration.getDecodedTransaction(
            contract,
            contracts,
            transaction,
          );
          mainWindow.webContents.send(
            GET_DECODED_TRANSACTION_INPUT,
            decodedData,
          );
        } catch (e) {
          mainWindow.webContents.send(GET_DECODED_TRANSACTION_INPUT, {
            error: { stack: e.stack, messages: e.message },
          });
        }
      },
    );

    ipcMain.on("web3-provider", (event, url) => {
      truffleIntegration.setWeb3(url);
    });

    truffleIntegration.start();

    global.bootstrap();
    workspaceManager.bootstrap();

    const standardWidth = 1200;
    const standardHeight = 800;
    const standardAspectRation = standardWidth / standardHeight;
    let appWidth = Math.min(standardWidth, width * 0.9);
    const appHeight = Math.min(800, (1 / standardAspectRation) * appWidth);
    appWidth = standardAspectRation * appHeight;

    Menu.setApplicationMenu(null)

    mainWindow = new BrowserWindow({
      show: false,
      minWidth: 950,
      minHeight: 670,
      width: appWidth,
      height: appHeight,
      frame: true,
      icon: getIconPath(),
      webPreferences: {
        nodeIntegration: true
      }
    });

    // Open the DevTools.
    if (isDevMode) {
      //installExtension(REACT_DEVELOPER_TOOLS);
      mainWindow.webContents.openDevTools();
    }

    // if a user clicks a link to an external webpage, open it in the user's browser, not our app
    mainWindow.webContents.on(
      "new-window",
      ensureExternalLinksAreOpenedInBrowser,
    );
    mainWindow.webContents.on(
      "will-navigate",
      ensureExternalLinksAreOpenedInBrowser,
    );

    if (isDevelopment) {
      mainWindow.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
    } else {
      mainWindow.loadURL(formatUrl({
        pathname: path.join(__dirname, "index.html"),
        protocol: 'file',
        slashes: true
      }));
    }

    mainWindow.webContents.on("did-finish-load", async () => {
      mainWindow.show();
      mainWindow.focus();
      mainWindow.setTitle("Ganache");

      // make sure the store registers the settings ASAP in the event of a startup crash
      const globalSettings = global.getAll();
      mainWindow.webContents.send(SET_SETTINGS, globalSettings, {});

      mainWindow.webContents.send(
        SET_WORKSPACES,
        workspaceManager.getNonDefaultNames(),
      );

      chain.on("start", async () => {
        if (workspace) {
          const workspaceSettings = workspace.settings.getAll();
          chain.startServer(workspaceSettings);
        }
      });

      chain.on("start-error", err => {
        err.code = "CUSTOMERROR";
        err.key = "workspace.server.chain";
        err.value = err.message + "\n\n" + err.stack;
        err.tab = "server";

        mainWindow.webContents.send(SET_SYSTEM_ERROR, err);
      });
      chain.on("server-started", data => {
        if (workspace) {
          mainWindow.webContents.send(SET_KEY_DATA, {
            privateKeys: data.privateKeys,
            mnemonic: data.mnemonic,
            hdPath: data.hdPath,
            fork_block_number: data.fork_block_number
          });

          workspace.settings.handleNewMnemonic(data.mnemonic);
          workspace.settings.handleNewForkBlockNumber(data.fork_block_number);

          const globalSettings = global.getAll();
          const workspaceSettings = workspace.settings.getAll();
          mainWindow.webContents.send(
            SET_SERVER_STARTED,
            globalSettings,
            workspaceSettings,
            startupMode,
          );
        }
      });

      chain.on("stdout", data => {
        // `mainWindow` can be null/undefined here if the process is killed
        // (common when developing)
        if (mainWindow) {
          mainWindow.webContents.send(ADD_LOG_LINES, data.split(/\n/g));
        }
      });

      chain.on("stderr", data => {
        const lines = data.split(/\n/g);
        // `mainWindow` can be null/undefined here if the process is killed
        // (common when developing)
        if (mainWindow) {
          mainWindow.webContents.send(ADD_LOG_LINES, lines);
        } else {
          // eslint-disable-next-line
          console.error(data);
        }
      });

      chain.on("error", async _error => {
        let error;
        if (_error instanceof Error) {
          // JSON.stringiy can't serialize error objects
          // so we just convert the Error to an Object here
          error = {};

          Object.getOwnPropertyNames(_error).forEach((key) => {
            error[key] = _error[key];
          });
        } else {
          error = _error;
        }
        mainWindow.webContents.send(SET_SYSTEM_ERROR, error);

        if (truffleIntegration) {
          await truffleIntegration.stopWatching();
        }

        if (chain.isServerStarted()) {
          // Something wrong happened in the chain, let's try to stop it
          await chain.stopServer();
        }
      });

      initAutoUpdates(globalSettings, mainWindow);
    });

    ipcMain.on(SAVE_WORKSPACE, async (event, workspaceName, mnemonic) => {
      if (truffleIntegration) {
        await truffleIntegration.stopWatching();
      }

      if (chain.isServerStarted()) {
        await chain.stopServer();
      }

      if (workspace) {
        const chaindataLocation =
          workspace.chaindataDirectory || (await chain.getDbLocation());

        workspace.saveAs(
          workspaceName,
          chaindataLocation,
          workspaceManager.directory,
          mnemonic,
        );
      } else {
        const defaultWorkspace = workspaceManager.get(null);

        defaultWorkspace.saveAs(
          workspaceName,
          null,
          workspaceManager.directory,
          mnemonic,
        );
      }

      workspaceManager.bootstrap();

      // eslint-disable-next-line
      workspace = workspaceManager.get(workspaceName);
      const workspaceSettings = workspace.settings.getAll();

      let tempWorkspace = {};
      merge(tempWorkspace, {}, workspace);
      delete tempWorkspace.contractCache;

      mainWindow.webContents.send(
        SET_CURRENT_WORKSPACE,
        tempWorkspace,
        workspace.contractCache.getAll(),
      );

      startupMode = STARTUP_MODE.SAVING_WORKSPACE;
      chain.startServer(workspaceSettings);

      // this sends the network interfaces to the renderer process for
      //  enumering in the config screen. it sends repeatedly
      continuouslySendNetworkInterfaces();

      const globalSettings = global.getAll();
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

    ipcMain.on(DELETE_WORKSPACE, async (event, name) => {
      const tempWorkspace = workspaceManager.get(name);
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
      if (workspace) {
        if (truffleIntegration) {
          await truffleIntegration.stopWatching();
        }

        if (chain.isServerStarted()) {
          await chain.stopServer();
        }
      }

      workspaceManager.bootstrap();

      const globalSettings = global.getAll();
      mainWindow.webContents.send(SET_SETTINGS, globalSettings, {});

      mainWindow.webContents.send(
        SET_WORKSPACES,
        workspaceManager.getNonDefaultNames(),
      );

      mainWindow.webContents.send(SHOW_HOME_SCREEN);
    });

    ipcMain.on(OPEN_WORKSPACE, async (event, name) => {
      if (workspace) {
        if (truffleIntegration) {
          await truffleIntegration.stopWatching();
        }

        if (chain.isServerStarted()) {
          await chain.stopServer();
        }
      }

      // eslint-disable-next-line
      workspace = workspaceManager.get(name);

      if (typeof workspace === "undefined") {
        // couldn't find the workspace in the manager?
      } else {
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
              await truffleIntegration.getProjectDetails(
                workspaceSettings.projects[i],
                workspaceSettings.server.network_id,
              ),
            );
          }
        }

        let tempWorkspace = {};
        merge(tempWorkspace, { projects }, workspace);
        delete tempWorkspace.contractCache;

        mainWindow.webContents.send(
          SET_CURRENT_WORKSPACE,
          tempWorkspace,
          workspace.contractCache.getAll(),
        );

        const globalSettings = global.getAll();
        mainWindow.webContents.send(
          SET_SETTINGS,
          globalSettings,
          tempWorkspace.settings.getAll(),
        );

        startupMode = STARTUP_MODE.NORMAL;
        chain.start();

        // this sends the network interfaces to the renderer process for
        //  enumering in the config screen. it sends repeatedly
        continuouslySendNetworkInterfaces();
      }
    });

    ipcMain.on(OPEN_NEW_WORKSPACE_CONFIG, async () => {
      if (truffleIntegration) {
        await truffleIntegration.stopWatching();
      }

      if (chain.isServerStarted()) {
        await chain.stopServer();
      }

      const defaultWorkspace = workspaceManager.get(null);
      const workspaceName = moniker.choose();
      const wallet = new ethagen({ entropyBits: 128 });
      defaultWorkspace.saveAs(
        workspaceName,
        null,
        workspaceManager.directory,
        wallet.mnemonic,
      );

      workspaceManager.bootstrap();

      workspace = workspaceManager.get(workspaceName);

      let tempWorkspace = {};
      merge(tempWorkspace, {}, workspace);
      delete tempWorkspace.contractCache;

      mainWindow.webContents.send(
        SET_CURRENT_WORKSPACE,
        tempWorkspace,
        workspace.contractCache.getAll(),
      );

      startupMode = STARTUP_MODE.NEW_WORKSPACE;
      chain.start();

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
        if (truffleIntegration) {
          await truffleIntegration.stopWatching();
        }

        if (chain.isServerStarted()) {
          await chain.stopServer();
        }

        if (startupMode === STARTUP_MODE.NEW_WORKSPACE) {
          // we just made a new workspace. we need to reset the chaindata since we initialized it
          // when started the configuration process
          workspace.resetChaindata();
        }

        const workspaceSettings = workspace.settings.getAll();

        let projects = [];
        for (let i = 0; i < workspaceSettings.projects.length; i++) {
          projects.push(
            await truffleIntegration.getProjectDetails(
              workspaceSettings.projects[i],
              workspaceSettings.server.network_id,
            ),
          );
        }

        let tempWorkspace = {};
        merge(tempWorkspace, { projects }, workspace);
        delete tempWorkspace.contractCache;

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

        chain.startServer(workspaceSettings);

        // send the interfaces again once on restart
        sendNetworkInterfaces();
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

    mainWindow.on("closed", () => {
      mainWindow = null;
    });

    mainWindow.webContents.on("context-menu", (e, props) => {
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
  }, 0);
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
