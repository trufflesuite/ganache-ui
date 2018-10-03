import path from 'path'
import fse from 'fs-extra'

import WorkspaceSettings from '../settings/WorkspaceSettings'

class Workspace {
  constructor(name, configDirectory) {
    this.name = name // null for quickstart/default workspace
    this.projects = []
    this.init(configDirectory)

    // This doesn't go in the init() function because the init is used for initializing
    //   the other parameters (and when the workspaced is "Saved As" something else)
    this.settings = new WorkspaceSettings(this.workspaceDirectory, this.chaindataDirectory)
  }

  init(configDirectory) {
    this.sanitizedName = Workspace.getSanitizedName(this.name)
    this.workspaceDirectory = Workspace.generateDirectoryPath(this.sanitizedName, configDirectory)
    this.basename = path.basename(this.workspaceDirectory)
    this.chaindataDirectory = this.generateChaindataDirectory()
  }

  static getSanitizedName(name) {
    return name === null ? null : name.replace(/\s/g, '-').replace(/[^a-zA-Z0-9\-\_\.]/g, '')
  }

  static generateDirectoryPath(sanitizedName, configDirectory) {
    if (sanitizedName === null) {
      return path.join(configDirectory, 'default')
    }
    else {
      return path.join(configDirectory, 'workspaces', sanitizedName)
    }
  }

  generateChaindataDirectory() {
    if (this.name === null) {
      return null
    }
    else {
      return path.join(this.workspaceDirectory, "chaindata")
    }
  }

  // creates the directory if needed (recursively)
  bootstrapDirectory() {
    // make sure the workspace directory exists
    fse.mkdirpSync(this.workspaceDirectory)

    // make sure the chaindata folder exists
    if (this.chaindataDirectory) {
      fse.mkdirpSync(this.chaindataDirectory)
    }
  }

  bootstrap() {
    this.bootstrapDirectory()
    this.settings.bootstrap()
  }

  saveAs(name, chaindataDirectory, configDirectory, mnemonic) {
    this.name = name
    this.init(configDirectory)
    this.bootstrapDirectory()

    this.settings.setDirectory(this.workspaceDirectory)
    this.settings.set("name", name)
    this.settings.set("isDefault", false)
    this.settings.set("randomizeMnemonicOnStart", false)
    this.settings.set("server.mnemonic", mnemonic)

    if (chaindataDirectory && chaindataDirectory !== this.chaindataDirectory) {
      fse.copySync(chaindataDirectory, this.chaindataDirectory)
    }
  }

  addProject(project) {
    this.projects.push(project)
  }
}

export default Workspace