import AppShell from 'Modules/AppShell'
import ConfigScreen from 'Modules/ConfigScreen'

import TestRPCSource from 'Data/Sources/TestRPC'

// Use this function to register your modules and/or your datasources, or your
// event listeners. The Redux Store is not yet available at this point
export default async function (app, done, error) {
  console.log(`Application '${app.name}' is starting...`)

  // Modules
  app.register(AppShell)
  app.register(ConfigScreen)

  // Data Sources
  app.register(TestRPCSource)

  app.on('applicationDidStart', async function (app) {

  })

  done()
}
