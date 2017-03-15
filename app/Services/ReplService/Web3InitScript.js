import fs from 'fs'
import path from 'path'

export default class Web3InitScript {
  constructor (testRpcHost, testRpcPort) {
    this.testRpcHost = testRpcHost
    this.testRpcPort = testRpcPort

    this.scriptBlob = ''
  }

  async compileScripts () {
    const scriptPath = path.resolve(__dirname, './Scripts')

    return new Promise((resolve, reject) => {
      fs.readdir(scriptPath, (err, files) => {
        if (err) {
          reject('Hmm. An error happened trying to compile the Web3 Init scripts together: ' + err)
        }

        files = files.sort((a,b) => { return a > b })

        resolve(files)
      })
    }).then((files) => {
      return Promise.all(files.map((file) => {
        if (file.match(/.js$/)) {
          return new Promise((resolve, reject) => {
            fs.readFile(path.join(scriptPath, file), 'utf8', (err, data) => {
              if (err) {
                console.log(err)
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
    console.log('Compiling dem Web Init scripts...')
    await this.compileScripts()
    console.log('...it is done')

    return this.scriptBlob.replace(/\$host\$/g, this.testRpcHost)
                          .replace(/\$port\$/g, this.testRpcPort)
  }
}
