import * as Core from '../Actions/Core'

import { initAutoUpdates } from '../Init/Renderer/AutoUpdate'
import { initCore } from '../Init/Renderer/Core'
import { initConfig } from '../Init/Renderer/Config'
import { initLogs } from '../Init/Renderer/Logs'
import { initNetwork } from '../Init/Renderer/Network'

// This will be called before the very first render, so you can do whatever
// you want here. The Redux Store is available at this point, so you can
// dispatch any action you want
export default function (store) {
  // Load the first screen while we wait for the application to load
  store.dispatch(Core.showTitleScreen())

  initCore(store)
  initConfig(store)
  initLogs(store)
  initNetwork(store)
  initAutoUpdates(store)
}
