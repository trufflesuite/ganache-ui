import { app, BrowserWindow, Menu, shell, ipcMain } from 'electron'
import { enableLiveReload } from 'electron-compile';
import { initAutoUpdates, getAutoUpdateService } from './Init/Main/AutoUpdate.js'
import path from 'path'
import * as os from 'os'

const isDevMode = process.execPath.match(/[\\/]electron/);


if (isDevMode) {
  enableLiveReload({strategy: 'react-hmr'});

  // let installExtension = require('electron-devtools-installer')
  // let REACT_DEVELOPER_TOOLS = installExtension.REACT_DEVELOPER_TOOLS
}

import { 
  REQUEST_SERVER_RESTART,
  SET_SERVER_STARTED,
  SET_SERVER_STOPPED,
  SET_KEY_DATA,
  SET_SYSTEM_ERROR
} from './Actions/Core'

import {
  SET_SETTINGS,
  REQUEST_SAVE_SETTINGS
} from './Actions/Config'

import {
  SET_INTERFACES
} from './Actions/Network'

import { ADD_LOG_LINES } from './Actions/Logs'

import ChainService from './Services/Chain'
import SettingsService from './Services/Settings'
import GoogleAnalyticsService from './Services/GoogleAnalytics'

let menu
let template
let mainWindow = null
let testRpcService = null
let consoleService = null // eslint-disable-line

// If you want to test out error handling
// setTimeout(() => {
//   throw new Error("Error from main process!")
// }, 8000)

process.on('uncaughtException', err => {
  if (mainWindow && err) {
    mainWindow.webContents.send(SET_SYSTEM_ERROR, err.stack || err)
  }
})

process.on('unhandledRejection', err => {
  if (mainWindow && err) {
    mainWindow.webContents.send(SET_SYSTEM_ERROR, err.stack || err)
  }
})

var shouldQuit = app.makeSingleInstance(function(commandLine, workingDirectory) {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

if (shouldQuit) {
  app.quit();
}

app.on('window-all-closed', () => {
  // don't quit the app before the updater can do its thing
  if (!getAutoUpdateService().isRestartingForUpdate) {
    app.quit()
  }
})

app.setName('Ganache')

const getIconPath = () => {
  return process.platform === 'win32'
    ? path.resolve(`${__dirname}/../resources/icons/win/icon.ico`)
    : path.resolve(`${__dirname}/../resources/icons/png/256x256.png`) // Mac & Linux, use an icon
}

if (process.platform === 'darwin') {
  app.dock.setIcon(getIconPath())
}

app.on('ready', () => {
  // workaround for electron race condition, causing hang on startup.
  // see https://github.com/electron/electron/issues/9179 for more info
  setTimeout(async () => {
    const chain = new ChainService(app)
    const Settings = new SettingsService()
    const GoogleAnalytics = new GoogleAnalyticsService()
    const inProduction = process.env.NODE_ENV === 'production'

    app.on('will-quit', function () {
      chain.stopProcess();
    });

    Settings.bootstrap();

    var settings = Settings.getAll()
    GoogleAnalytics.setup(settings.googleAnalyticsTracking && inProduction, settings.uuid)
    GoogleAnalytics.reportSettings(settings)

    mainWindow = new BrowserWindow({
      show: false,
      minWidth: 1200,
      minHeight: 800,
      width: 1200,
      height: 930,
      frame: true,
      icon: getIconPath()
    })

    // Open the DevTools.
    if (isDevMode) {
      //installExtension(REACT_DEVELOPER_TOOLS);
      mainWindow.webContents.openDevTools();
    }

    // if a user clicks a link to an external webpage, open it in the user's browser, not our app
    mainWindow.webContents.on('new-window', ensureExternalLinksAreOpenedInBrowser);
    mainWindow.webContents.on('will-navigate', ensureExternalLinksAreOpenedInBrowser);


    mainWindow.loadURL(`file://${__dirname}/app.html`)
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.show()
      mainWindow.focus()
      mainWindow.setTitle('Ganache')
      initAutoUpdates(Settings.getAll(), mainWindow)

      // Remove the menu bar
      mainWindow.setMenu(null);

      // make sure the store registers the settings ASAP in the event of a startup crash
      mainWindow.webContents.send(SET_SETTINGS, Settings.getAll())

      chain.on("start", () => {
        chain.startServer(Settings.getAll())
      })

      chain.on("server-started", (data) => {
        mainWindow.webContents.send(SET_KEY_DATA, { 
          privateKeys: data.privateKeys,
          mnemonic: data.mnemonic,
          hdPath: data.hdPath
        })

        Settings.handleNewMnemonic(data.mnemonic)

        mainWindow.webContents.send(SET_SERVER_STARTED, Settings.getAll())
      })

      chain.on("stdout", (data) => {
        mainWindow.webContents.send(ADD_LOG_LINES, data.split(/\n/g))
      })

      chain.on("stderr", (data) => {
        const lines = data.split(/\n/g)
        mainWindow.webContents.send(ADD_LOG_LINES, lines)
      })

      chain.on("error", (error) => {
        mainWindow.webContents.send(SET_SYSTEM_ERROR, error)

        if (chain.isServerStarted()) {
          // Something wrong happened in the chain, let's try to stop it
          chain.stopServer()
        }
      })

      chain.start()

      // this sends the network interfaces to the renderer process for
      //  enumering in the config screen. it sends repeatedly
      continuouslySendNetworkInterfaces()
    })

    // If the frontend asks to start the server, start the server.
    // This will trigger then chain event handlers above once the server stops.
    ipcMain.on(REQUEST_SERVER_RESTART, () => {
      // make sure the store registers the settings ASAP in the event of a startup crash
      mainWindow.webContents.send(SET_SETTINGS, Settings.getAll())

      if (chain.isServerStarted()) {
        chain.once("server-stopped", () => {
          chain.startServer(Settings.getAll())

          // send the interfaces again once on restart
          sendNetworkInterfaces()
        })
        chain.stopServer()
      } else {
        chain.startServer(Settings.getAll())
      }
    })

    ipcMain.on(REQUEST_SAVE_SETTINGS, (event, settings) => {
      Settings.setAll(settings)
      GoogleAnalytics.reportSettings(settings)
    })

    mainWindow.on('closed', () => {
      mainWindow = null
    })

    mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click () {
            mainWindow.inspectElement(x, y)
          }
        }
      ]).popup(mainWindow)
    })

    if (process.platform === 'darwin') {
      const navigate = (path) => mainWindow.webContents.send('navigate', path);
      template = [
        {
          label: 'Ganache',
          submenu: [
            {
              label: 'About Ganache ' + app.getVersion(),
              selector: 'orderFrontStandardAboutPanel:'
            },
            {
              type: 'separator'
            },
            {
              label: 'Preferences...',
              accelerator: 'Command+,',
              click(){ navigate('/config') }
            },
            {
                type: 'separator'
            },
            {
              type: 'separator'
            },
            {
              label: 'Services',
              submenu: []
            },
            {
              type: 'separator'
            },
            {
              label: 'Hide Ganache',
              accelerator: 'Command+H',
              selector: 'hide:'
            },
            {
              label: 'Hide Others',
              accelerator: 'Command+Shift+H',
              selector: 'hideOtherApplications:'
            },
            {
              label: 'Show All',
              selector: 'unhideAllApplications:'
            },
            {
              type: 'separator'
            },
            {
              label: 'Quit',
              accelerator: 'Command+Q',
              click () {
                app.quit()
              }
            }
          ]
        },
        {
          label: 'Edit',
          submenu: [
            {
              label: 'Undo',
              accelerator: 'Command+Z',
              selector: 'undo:'
            },
            {
              label: 'Redo',
              accelerator: 'Shift+Command+Z',
              selector: 'redo:'
            },
            {
              type: 'separator'
            },
            {
              label: 'Cut',
              accelerator: 'Command+X',
              selector: 'cut:'
            },
            {
              label: 'Copy',
              accelerator: 'Command+C',
              selector: 'copy:'
            },
            {
              label: 'Paste',
              accelerator: 'Command+V',
              selector: 'paste:'
            },
            {
              label: 'Select All',
              accelerator: 'Command+A',
              selector: 'selectAll:'
            }
          ]
        },
        {
          label: 'View',
          submenu:
          process.env.NODE_ENV === 'development'
          ? [
            {
              label: 'Reload',
              accelerator: 'Command+R',
              click () {
                mainWindow.webContents.reload()
              }
            },
            {
              label: 'Toggle Full Screen',
              accelerator: 'Ctrl+Command+F',
              click () {
                mainWindow.setFullScreen(!mainWindow.isFullScreen())
              }
            },
            {
              label: 'Toggle Developer Tools',
              accelerator: 'Alt+Command+I',
              click () {
                mainWindow.toggleDevTools()
              }
            }
          ]
          : [
            {
              label: 'Toggle Full Screen',
              accelerator: 'Ctrl+Command+F',
              click () {
                mainWindow.setFullScreen(!mainWindow.isFullScreen())
              }
            }
          ]
        },
        {
          label: 'Window',
          submenu: [
            {
              label: 'Accounts',
              accelerator: 'Command+1',
              click(){ navigate('/accounts') }
            },
            {
              label: 'Blocks',
              accelerator: 'Command+2',
              click(){ navigate('/blocks') }
            },
            {
              label: 'Transactions',
              accelerator: 'Command+3',
              click(){ navigate('/transactions') }
            },
            {
              label: 'Logs',
              accelerator: 'Command+4',
              click(){ navigate('/logs') }
            },
            {
              label: 'Settings',
              accelerator: 'Command+5',
              click(){ navigate('/config') }
            },
            {
              label: 'Minimize',
              accelerator: 'Command+M',
              selector: 'performMiniaturize:'
            },
            {
              label: 'Close',
              accelerator: 'Command+W',
              selector: 'performClose:'
            },
            {
              type: 'separator'
            },
            {
              label: 'Bring All to Front',
              selector: 'arrangeInFront:'
            }
          ]
        },
        {
          label: 'Help',
          submenu: [
            {
              label: 'Learn More',
              click () {
                shell.openExternal('http://truffleframework.com/suite/ganache')
              }
            },
            {
              label: 'Documentation',
              click () {
                shell.openExternal(
                  'https://github.com/trufflesuite/ganache/blob/master/README.md'
                )
              }
            },
            {
              label: 'Community Discussions',
              click () {
                shell.openExternal(
                  'https://github.com/trufflesuite/ganache/issues'
                )
              }
            },
            {
              label: 'Search Issues',
              click () {
                shell.openExternal(
                  'https://github.com/trufflesuite/ganache/issues'
                )
              }
            }
          ]
        }
      ]

      menu = Menu.buildFromTemplate(template)
      Menu.setApplicationMenu(menu)
    } else {
      template = [
        {
          label: '&File',
          submenu: [
            {
              label: '&Open',
              accelerator: 'Ctrl+O'
            },
            {
              label: '&Close',
              accelerator: 'Ctrl+W',
              click () {
                mainWindow.close()
              }
            }
          ]
        },
        {
          label: '&View',
          submenu:
          process.env.NODE_ENV === 'development'
          ? [
            {
              label: '&Reload',
              accelerator: 'Ctrl+R',
              click () {
                mainWindow.webContents.reload()
              }
            },
            {
              label: 'Toggle &Full Screen',
              accelerator: 'F11',
              click () {
                mainWindow.setFullScreen(!mainWindow.isFullScreen())
              }
            },
            {
              label: 'Toggle &Developer Tools',
              accelerator: 'Alt+Ctrl+I',
              click () {
                mainWindow.toggleDevTools()
              }
            }
          ]
          : [
            {
              label: 'Toggle &Full Screen',
              accelerator: 'F11',
              click () {
                mainWindow.setFullScreen(!mainWindow.isFullScreen())
              }
            }
          ]
        },
        {
          label: 'Help',
          submenu: [
            {
              label: 'Learn More',
              click () {
                shell.openExternal('http://truffleframework.com/suite/ganache')
              }
            },
            {
              label: 'Documentation',
              click () {
                shell.openExternal(
                  'https://github.com/trufflesuite/ganache/blob/master/README.md'
                )
              }
            },
            {
              label: 'Community Discussions',
              click () {
                shell.openExternal(
                  'https://github.com/trufflesuite/ganache/issues'
                )
              }
            },
            {
              label: 'Search Issues',
              click () {
                shell.openExternal(
                  'https://github.com/trufflesuite/ganache/issues'
                )
              }
            }
          ]
        }
      ]
      menu = Menu.buildFromTemplate(template)
      Menu.setApplicationMenu(menu)
    }
  }, 0)
})

  // Do this every 2 minutes to keep it up to date without
  //   being unreasonable since it shouldn't change frequently
function continuouslySendNetworkInterfaces() {
  sendNetworkInterfaces()

  setInterval(() => {
    sendNetworkInterfaces()
  }, 2 * 60 * 1000)
}

function sendNetworkInterfaces() {
  // Send the network interfaces to the renderer process
  const interfaces = os.networkInterfaces()

  if (mainWindow) {
    mainWindow.webContents.send(SET_INTERFACES, interfaces)
  }
}

function ensureExternalLinksAreOpenedInBrowser(event, url) {
  // we're a one-window application, and we only ever want to load external
  // resources in the user's browser, not via a new browser window
  if (url.startsWith('http:') || url.startsWith('https:')) {
    shell.openExternal(url)
    event.preventDefault()
  }
}
