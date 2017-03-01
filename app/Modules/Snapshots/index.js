import Module from 'Core/Module'
import Routes from './Routes'

const module = new Module({
  name: 'Snapshots',
  routes: Routes
})

module.submoduleOf('AppShell')

export default module
