import Module from 'Core/Module'
import Routes from './Routes'

const module = new Module({
  name: 'Dashboard',
  routes: Routes
})

module.submoduleOf('AppShell')

export default module
