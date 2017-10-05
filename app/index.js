import Application from 'Core/Application'

import TestRPCSource from 'Data/Sources/TestRPC'
import ConsoleSource from 'Data/Sources/Console'
import AppUpdaterSource from 'Data/Sources/AppUpdater'
import SettingsSource from 'Data/Sources/Settings'

import ready from 'Kernel/ready'

import './app.global.css'

import '../resources/fonts/FiraSans-Regular.ttf'
import '../resources/fonts/FiraSans-Bold.ttf'
import '../resources/fonts/FiraSans-SemiBold.ttf'

const Ganache = new Application('Ganache')

Ganache.init(async function (app, done, error) {
  console.log(`Application '${app.name}' is starting...`)

  // Data Sources
  app.registerReducer(TestRPCSource)
  app.registerReducer(ConsoleSource)
  app.registerReducer(AppUpdaterSource)
  app.registerReducer(SettingsSource)

  app.on('applicationDidStart', async function (app) {})

  done()
}).ready(ready).start('root')
