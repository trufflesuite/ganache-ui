import AppShell from 'Modules/AppShell'
import ConfigScreen from 'Modules/ConfigScreen'
import Dashboard from 'Modules/Dashboard'
import BlockExplorer from 'Modules/BlockExplorer'
import Snapshots from 'Modules/Snapshots'
import Repl from 'Modules/Repl'

import TestRPCSource from 'Data/Sources/TestRPC'
import ReplSource from 'Data/Sources/Repl'

// Use this function to register your modules and/or your datasources, or your
// event listeners. The Redux Store is not yet available at this point
export default async function (app, done, error) {
  console.log(`Application '${app.name}' is starting...`)

  // Modules
  app.register(AppShell)
  app.register(ConfigScreen)
  app.register(Dashboard)
  app.register(BlockExplorer)
  app.register(Snapshots)
  app.register(Repl)

  // Data Sources
  app.register(TestRPCSource)
  app.register(ReplSource)

  app.on('applicationDidStart', async function (app) {

  })

  done()
}
