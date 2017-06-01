import 'babel-polyfill'

import Application from 'Core/Application'

import bootup from 'Kernel/bootup'
import ready from 'Kernel/ready'

import './app.global.css'

import '../resources/fonts/FiraSans-Regular.ttf'
import '../resources/fonts/FiraSans-Bold.ttf'
import '../resources/fonts/FiraSans-SemiBold.ttf'

const Ganache = new Application('GANACHE')

Ganache
  .init(bootup)
  .ready(ready)
  .start('root')
