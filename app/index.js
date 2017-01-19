import 'babel-polyfill'

import Application from 'Core/Application'

import bootup from 'Kernel/bootup'
import ready from 'Kernel/ready'

import './app.global.css'

const Zircon = new Application('ZIRCON')

Zircon
  .init(bootup)
  .ready(ready)
  .start('root')
