import path from 'path'
import fse from 'fs-extra'
import { app } from 'electron'

import WorkspaceSettings, { DEFAULT_WORKSPACE_NAME } from './Settings/WorkspaceSettings'

class Workspace {
  constructor(name, projects) {
    this.name = name
    this.projects = projects || []
    this.init()

    // This doesn't go in the init() function because the init is used for initializing
    //   the other parameters (and when the workspaced is "Saved As" something else)
    this.settings = new WorkspaceSettings(this.workspaceDirectory, this.chaindataDirectory)
  }

  init() {
    this.workspaceDirectory = Workspace.generateDirectoryPath(this.name)
    this.basename = path.basename(this.workspaceDirectory)
    this.chaindataDirectory = this.generateChaindataDirectory()
  }

  static generateDirectoryPath(name) {
    if (name === DEFAULT_WORKSPACE_NAME) {
      return path.join(app.getPath('userData'), 'default')
    }
    else {
      const sanitizedName = name.replace(/\s/g, '-').replace(/[^a-zA-Z0-9\-\_\.]/g, '')
      return path.join(app.getPath('userData'), 'workspaces', sanitizedName)
    }
  }

  generateChaindataDirectory() {
    if (this.name === DEFAULT_WORKSPACE_NAME) {
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

  async bootstrap() {
    this.bootstrapDirectory()
    await this.settings.bootstrap()
  }

  async saveAs(name, chaindataDirectory) {
    this.name = name
    this.init()
    this.bootstrapDirectory()

    this.settings.setDirectory(this.workspaceDirectory)
    await this.settings.set("name", name)

    if (chaindataDirectory && chaindataDirectory !== this.chaindataDirectory) {
      fse.copySync(chaindataDirectory, this.chaindataDirectory)
    }
  }

  addProject(project) {
    this.projects.push(project)
  }
}

export default Workspace