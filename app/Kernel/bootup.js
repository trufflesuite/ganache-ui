import AppShell from 'Modules/AppShell'
import ConfigScreen from 'Modules/ConfigScreen'
import Accounts from 'Modules/Accounts'
import Blocks from 'Modules/Blocks'
import Transactions from 'Modules/Transactions'
import Console from 'Modules/Console'

import TestRPCSource from 'Data/Sources/TestRPC'
import ConsoleSource from 'Data/Sources/Console'

// Use this function to register your modules and/or your datasources, or your
// event listeners. The Redux Store is not yet available at this point
export default async function (app, done, error) {
  console.log(`Application '${app.name}' is starting...`)

  // Modules
  app.register(AppShell)
  app.register(ConfigScreen)
  app.register(Accounts)
  app.register(Blocks)
  app.register(Transactions)
  app.register(Console)

  // Data Sources
  app.register(TestRPCSource)
  app.register(ConsoleSource)

  app.on('applicationDidStart', async function (app) {

  })

  done()
}
