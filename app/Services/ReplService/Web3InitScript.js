import fs from 'fs'
import path from 'path'
import SysLog from 'electron-log'

export default class Web3InitScript {
  constructor (testRpcHost, testRpcPort) {
    this.testRpcHost = testRpcHost
    this.testRpcPort = testRpcPort

    this.scriptBlob = ''
  }

  async compileScripts () {
    let scriptPath = path.join(__dirname, 'ReplScripts')

    if (process.env.NODE_ENV === 'production') {
      scriptPath = path.join(__dirname, '../ReplScripts')
    }

    SysLog.info(`Looking for ReplScripts in ${scriptPath}`)

    return new Promise((resolve, reject) => {
      fs.readdir(scriptPath, (err, files) => {
        if (err) {
          reject('Hmm. An error happened trying to compile the Web3 Init scripts together: ' + err)
        }

        files = files.sort((a, b) => { return a > b })

        resolve(files)
      })
    }).then((files) => {
      return Promise.all(files.map((file) => {
        if (file.match(/.js$/)) {
          return new Promise((resolve, reject) => {
            SysLog.info(`Reading ReplScript: ${path.join(scriptPath, file)}`)
            fs.readFile(path.join(scriptPath, file), 'utf8', (err, data) => {
              if (err) {
                SysLog.error(err)
              }
              resolve(data)
            })
          })
        }
      }))
    }).then((fileContents) => {
      fileContents = fileContents.filter((c) => { return c !== undefined })
      return Promise.all(fileContents.map((content) => {
        return new Promise((resolve, reject) => {
          this.scriptBlob += '\n' + content
          resolve()
        })
      }))
    })
  }

  async exportedScript () {
    SysLog.info('Compiling Web3 Init scripts...')
    await this.compileScripts()
    SysLog.info('...it is done')

    return this.scriptBlob.replace(/\$host\$/g, this.testRpcHost)
                          .replace(/\$port\$/g, this.testRpcPort)
  }
}
