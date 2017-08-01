const fs = require('fs-extra')
const path = require('path')
const plist = require('plist')
const rcedit = require('rcedit')

const packageJSON = require('../package.json')

if (process.platform === 'darwin') {
  console.log('🚧  Monkey patching your local Electron Info.plist to make it look like Ganache')
  // Patch Info.plist values
  const plistPath = path.resolve(
    __dirname,
    '..',
    'node_modules/electron/dist/Electron.app/Contents/Info.plist'
  )
  const plistContent = plist.parse(fs.readFileSync(plistPath, 'utf8'))

  plistContent.CFBundleDisplayName = packageJSON.productName
  plistContent.CFBundleExecutable = packageJSON.productName
  plistContent.CFBundleIdentifier = `com.dev.${packageJSON.name}`
  plistContent.CFBundleName = packageJSON.productName
  plistContent.CFBundleVersion = packageJSON.version
  plistContent.CFBundleShortVersionString = packageJSON.version

  fs.writeFileSync(plistPath, plist.build(plistContent))
} else if (process.platform === 'win32') {
  console.log('Monkey patching your electron.exe icon')
  const icon = path.resolve(__dirname, '../resources/icons/win/icon.ico')
  rcedit(require('electron'), {
    icon
  }, () => {})
}
