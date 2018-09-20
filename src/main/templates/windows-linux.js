
import { shell, remote } from 'electron'

const mainWindow = remote.getCurrentWindow()

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
          shell.openExternal('https://truffleframework.com/ganache')
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