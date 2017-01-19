import AppShell from 'Modules/AppShell'

// Use this function to register your modules and/or your datasources, or your
// event listeners. The Redux Store is not yet available at this point
export default async function (app, done, error) {
  console.log(`Application '${app.name}' is starting...`)

  // Modules
  app.register(AppShell)

  // Data Sources

  app.on('applicationDidStart', async function (app) {

  })

  done()
}
