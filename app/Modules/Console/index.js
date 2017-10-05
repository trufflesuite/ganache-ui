import Module from 'Core/Module'

const module = new Module({
  name: 'Console'
})

module.submoduleOf('AppShell')

export default module
