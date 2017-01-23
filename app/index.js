import 'babel-polyfill'

import Application from 'Core/Application'

import bootup from 'Kernel/bootup'
import ready from 'Kernel/ready'

import './app.global.css'

import '../resources/fonts/RopaSans-Regular.ttf'

const Zircon = new Application('ZIRCON')

Zircon
  .init(bootup)
  .ready(ready)
  .start('root')
