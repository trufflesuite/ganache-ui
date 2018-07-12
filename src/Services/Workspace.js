import path from 'path'
import fs from 'fs'
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
    const folders = this.workspaceDirectory.split(path.sep)

    // make sure the workspace directory exists
    let curPath = ""
    for (let i = 0; i < folders.length; i++) {
      curPath += folders[i] + path.sep
      if (!fs.existsSync(curPath)) {
        fs.mkdirSync(curPath)
      }
    }

    // make sure the chaindata folder exists
    if (this.chaindataDirectory) {
      if (!fs.existsSync(this.chaindataDirectory)) {
        fs.mkdirSync(this.chaindataDirectory)
      }
    }
  }

  async bootstrap() {
    this.bootstrapDirectory()
    await this.settings.bootstrap()
  }

  async saveAs(name) {
    this.name = name
    this.init()
    this.bootstrapDirectory()

    this.settings.setDirectory(this.workspaceDirectory)
    await this.settings.set("name", name)
  }

  addProject(project) {
    this.projects.push(project)
  }
}

export default Workspace