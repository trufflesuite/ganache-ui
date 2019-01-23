import { app, BrowserWindow, Menu, shell, ipcMain, screen } from "electron";
import { enableLiveReload } from "electron-compile";
import { initAutoUpdates, getAutoUpdateService } from "./init/AutoUpdate.js";
import path from "path";
import * as os from "os";
import merge from "lodash.merge";
import ethagen from "ethagen";
import moniker from "moniker";

const isDevMode = process.execPath.match(/[\\/]electron/);

if (isDevMode) {
  enableLiveReload({ strategy: "react-hmr" });

  // let installExtension = require('electron-devtools-installer')
  // let REACT_DEVELOPER_TOOLS = installExtension.REACT_DEVELOPER_TOOLS
}

import {
  REQUEST_SERVER_RESTART,
  SET_SERVER_STARTED,
  SET_KEY_DATA,
  SET_SYSTEM_ERROR,
  SHOW_HOME_SCREEN,
} from "../common/redux/core/actions";

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

let menu;
let template;
let mainWindow = null;
let consoleService = null; // eslint-disable-line

// If you want to test out error handling
// setTimeout(() => {
//   throw new Error("Error from main process!")
// }, 8000)

process.on("uncaughtException", err => {
  if (mainWindow && err) {
    mainWindow.webContents.send(SET_SYSTEM_ERROR, err.stack || err);
  }
});

process.on("unhandledRejection", err => {
  if (mainWindow && err) {
    mainWindow.webContents.send(SET_SYSTEM_ERROR, err.stack || err);
  }
});

app.setName("Ganache");

const getIconPath = () => {
  return process.platform === "win32"
    ? path.resolve(`${__dirname}/../../resources/icons/win/icon.ico`)
    : path.resolve(`${__dirname}/../../resources/icons/png/256x256.png`); // Mac & Linux, use an icon
};

if (process.platform === "darwin") {
  app.dock.setIcon(getIconPath());
}

app.on("ready", () => {
  // workaround for electron race condition, causing hang on startup.
  // see https://github.com/electron/electron/issues/9179 for more info

  setTimeout(async () => {
    const width = screen.getPrimaryDisplay().bounds.width;
    const chain = new ChainService(app);
    const truffleIntegration = new TruffleIntegrationService();
    const global = new GlobalSettings(
      path.join(app.getPath("userData"), "global"),
    );
    const GoogleAnalytics = new GoogleAnalyticsService();
    const workspaceManager = new WorkspaceManager(app.getPath("userData"));
    let workspace;
    let startupMode = STARTUP_MODE.NORMAL;

    app.on("window-all-closed", async () => {
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
    });

    truffleIntegration.on("error", async error => {
      if (mainWindow) {
        mainWindow.webContents.send(SET_SYSTEM_ERROR, error);
      }

      if (truffleIntegration) {
        await truffleIntegration.stopWatching();
      }

      if (chain.isServerStarted()) {
        // Something wrong happened in the chain, let's try to stop it
        await chain.stopServer();
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
      const decodedLog = await truffleIntegration.getDecodedEvent(
        contract,
        contracts,
        log,
      );
      mainWindow.webContents.send(GET_DECODED_EVENT, decodedLog);
    });

    ipcMain.on(
      GET_DECODED_TRANSACTION_INPUT,
      async (event, contract, contracts, transaction) => {
        const decodedData = await truffleIntegration.getDecodedTransaction(
          contract,
          contracts,
          transaction,
        );
        mainWindow.webContents.send(GET_DECODED_TRANSACTION_INPUT, decodedData);
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

    mainWindow = new BrowserWindow({
      show: false,
      minWidth: 950,
      minHeight: 670,
      width: appWidth,
      height: appHeight,
      frame: true,
      icon: getIconPath(),
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

    mainWindow.loadURL(`file://${__dirname}/../renderer/app.html`);
    mainWindow.webContents.on("did-finish-load", async () => {
      mainWindow.show();
      mainWindow.focus();
      mainWindow.setTitle("Ganache");

      // Remove the menu bar
      mainWindow.setMenu(null);

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

      chain.on("server-started", data => {
        if (workspace) {
          mainWindow.webContents.send(SET_KEY_DATA, {
            privateKeys: data.privateKeys,
            mnemonic: data.mnemonic,
            hdPath: data.hdPath,
          });

          workspace.settings.handleNewMnemonic(data.mnemonic);

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
        mainWindow.webContents.send(ADD_LOG_LINES, data.split(/\n/g));
      });

      chain.on("stderr", data => {
        const lines = data.split(/\n/g);
        mainWindow.webContents.send(ADD_LOG_LINES, lines);
      });

      chain.on("error", async error => {
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
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: "Inspect element",
          click() {
            mainWindow.inspectElement(x, y);
          },
        },
      ]).popup(mainWindow);
    });

    if (process.platform === "darwin") {
      const navigate = path => mainWindow.webContents.send("navigate", path);
      template = [
        {
          label: "Ganache",
          submenu: [
            {
              label: "About Ganache " + app.getVersion(),
              selector: "orderFrontStandardAboutPanel:",
            },
            {
              type: "separator",
            },
            {
              label: "Preferences...",
              accelerator: "Command+,",
              click() {
                navigate("/config");
              },
            },
            {
              type: "separator",
            },
            {
              type: "separator",
            },
            {
              label: "Services",
              submenu: [],
            },
            {
              type: "separator",
            },
            {
              label: "Hide Ganache",
              accelerator: "Command+H",
              selector: "hide:",
            },
            {
              label: "Hide Others",
              accelerator: "Command+Shift+H",
              selector: "hideOtherApplications:",
            },
            {
              label: "Show All",
              selector: "unhideAllApplications:",
            },
            {
              type: "separator",
            },
            {
              label: "Quit",
              accelerator: "Command+Q",
              click() {
                app.quit();
              },
            },
          ],
        },
        {
          label: "Edit",
          submenu: [
            {
              label: "Undo",
              accelerator: "Command+Z",
              selector: "undo:",
            },
            {
              label: "Redo",
              accelerator: "Shift+Command+Z",
              selector: "redo:",
            },
            {
              type: "separator",
            },
            {
              label: "Cut",
              accelerator: "Command+X",
              selector: "cut:",
            },
            {
              label: "Copy",
              accelerator: "Command+C",
              selector: "copy:",
            },
            {
              label: "Paste",
              accelerator: "Command+V",
              selector: "paste:",
            },
            {
              label: "Select All",
              accelerator: "Command+A",
              selector: "selectAll:",
            },
          ],
        },
        {
          label: "View",
          submenu:
            process.env.NODE_ENV === "development"
              ? [
                  {
                    label: "Reload",
                    accelerator: "Command+R",
                    click() {
                      mainWindow.webContents.reload();
                    },
                  },
                  {
                    label: "Toggle Full Screen",
                    accelerator: "Ctrl+Command+F",
                    click() {
                      mainWindow.setFullScreen(!mainWindow.isFullScreen());
                    },
                  },
                  {
                    label: "Toggle Developer Tools",
                    accelerator: "Alt+Command+I",
                    click() {
                      mainWindow.toggleDevTools();
                    },
                  },
                ]
              : [
                  {
                    label: "Toggle Full Screen",
                    accelerator: "Ctrl+Command+F",
                    click() {
                      mainWindow.setFullScreen(!mainWindow.isFullScreen());
                    },
                  },
                ],
        },
        {
          label: "Window",
          submenu: [
            {
              label: "Accounts",
              accelerator: "Command+1",
              click() {
                navigate("/accounts");
              },
            },
            {
              label: "Blocks",
              accelerator: "Command+2",
              click() {
                navigate("/blocks");
              },
            },
            {
              label: "Transactions",
              accelerator: "Command+3",
              click() {
                navigate("/transactions");
              },
            },
            {
              label: "Logs",
              accelerator: "Command+4",
              click() {
                navigate("/logs");
              },
            },
            {
              label: "Settings",
              accelerator: "Command+5",
              click() {
                navigate("/config");
              },
            },
            {
              label: "Minimize",
              accelerator: "Command+M",
              selector: "performMiniaturize:",
            },
            {
              label: "Close",
              accelerator: "Command+W",
              selector: "performClose:",
            },
            {
              type: "separator",
            },
            {
              label: "Bring All to Front",
              selector: "arrangeInFront:",
            },
          ],
        },
        {
          label: "Help",
          submenu: [
            {
              label: "Learn More",
              click() {
                shell.openExternal("https://truffleframework.com/ganache");
              },
            },
            {
              label: "Documentation",
              click() {
                shell.openExternal(
                  "https://github.com/trufflesuite/ganache/blob/master/README.md",
                );
              },
            },
            {
              label: "Community Discussions",
              click() {
                shell.openExternal(
                  "https://github.com/trufflesuite/ganache/issues",
                );
              },
            },
            {
              label: "Search Issues",
              click() {
                shell.openExternal(
                  "https://github.com/trufflesuite/ganache/issues",
                );
              },
            },
          ],
        },
      ];

      menu = Menu.buildFromTemplate(template);
      Menu.setApplicationMenu(menu);
    } else {
      template = [
        {
          label: "&File",
          submenu: [
            {
              label: "&Open",
              accelerator: "Ctrl+O",
            },
            {
              label: "&Close",
              accelerator: "Ctrl+W",
              click() {
                mainWindow.close();
              },
            },
          ],
        },
        {
          label: "&View",
          submenu:
            process.env.NODE_ENV === "development"
              ? [
                  {
                    label: "&Reload",
                    accelerator: "Ctrl+R",
                    click() {
                      mainWindow.webContents.reload();
                    },
                  },
                  {
                    label: "Toggle &Full Screen",
                    accelerator: "F11",
                    click() {
                      mainWindow.setFullScreen(!mainWindow.isFullScreen());
                    },
                  },
                  {
                    label: "Toggle &Developer Tools",
                    accelerator: "Alt+Ctrl+I",
                    click() {
                      mainWindow.toggleDevTools();
                    },
                  },
                ]
              : [
                  {
                    label: "Toggle &Full Screen",
                    accelerator: "F11",
                    click() {
                      mainWindow.setFullScreen(!mainWindow.isFullScreen());
                    },
                  },
                ],
        },
        {
          label: "Help",
          submenu: [
            {
              label: "Learn More",
              click() {
                shell.openExternal("https://truffleframework.com/ganache");
              },
            },
            {
              label: "Documentation",
              click() {
                shell.openExternal(
                  "https://github.com/trufflesuite/ganache/blob/master/README.md",
                );
              },
            },
            {
              label: "Community Discussions",
              click() {
                shell.openExternal(
                  "https://github.com/trufflesuite/ganache/issues",
                );
              },
            },
            {
              label: "Search Issues",
              click() {
                shell.openExternal(
                  "https://github.com/trufflesuite/ganache/issues",
                );
              },
            },
          ],
        },
      ];
      menu = Menu.buildFromTemplate(template);
      Menu.setApplicationMenu(menu);
    }
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
