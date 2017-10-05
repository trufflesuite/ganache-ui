import AppShell from 'Modules/AppShell'
import Config from 'Modules/Config'
import Accounts from 'Modules/Accounts'
import Blocks from 'Modules/Blocks'
import Transactions from 'Modules/Transactions'
import Console from 'Modules/Console'
import AppUpdateScreen from 'Modules/AppUpdate'
import FirstRunScreen from 'Modules/FirstRun'

import TestRPCSource from 'Data/Sources/TestRPC'
import ConsoleSource from 'Data/Sources/Console'
import AppUpdaterSource from 'Data/Sources/AppUpdater'
import SettingsSource from 'Data/Sources/Settings'

// Use this function to register your modules and/or your datasources, or your
// event listeners. The Redux Store is not yet available at this point
export default async function (app, done, error) {
  console.log(`Application '${app.name}' is starting...`)

  // Data Sources
  app.registerReducer(TestRPCSource)
  app.registerReducer(ConsoleSource)
  app.registerReducer(AppUpdaterSource)
  app.registerReducer(SettingsSource)

  app.on('applicationDidStart', async function (app) {})

  done()
}
