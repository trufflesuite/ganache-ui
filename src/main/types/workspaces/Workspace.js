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
    this.sanitizedName = this.getSanitizedName()
    this.workspaceDirectory = Workspace.generateDirectoryPath(this.sanitizedName, configDirectory)
    this.basename = path.basename(this.workspaceDirectory)
    this.chaindataDirectory = this.generateChaindataDirectory()
  }

  getSanitizedName() {
    return this.name === null ? null : this.name.replace(/\s/g, '-').replace(/[^a-zA-Z0-9\-\_\.]/g, '')
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

  saveAs(name, chaindataDirectory, configDirectory) {
    this.name = name
    this.init(configDirectory)
    this.bootstrapDirectory()

    this.settings.setDirectory(this.workspaceDirectory)
    this.settings.set("name", name)
    this.settings.set("isDefault", false)

    if (chaindataDirectory && chaindataDirectory !== this.chaindataDirectory) {
      fse.copySync(chaindataDirectory, this.chaindataDirectory)
    }
  }

  addProject(project) {
    this.projects.push(project)
  }
}

export default Workspace