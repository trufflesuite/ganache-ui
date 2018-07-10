import path from 'path'
import fs from 'fs'
import { app } from 'electron'

import WorkspaceSettings from './Settings/WorkspaceSettings'

class Workspace {
  constructor(name, projects) {
    this.name = name || ""
    this.projects = projects || []
    this.workspaceDirectory = Workspace.generateDirectoryPath(this.name)
    this.settings = new WorkspaceSettings(this.workspaceDirectory)
  }

  static generateDirectoryPath(name) {
    if (name === "") {
      return path.join(app.getPath('userData'), 'default')
    }
    else {
      return path.join(app.getPath('userData'), 'workspaces', name)
    }
  }

  // creates the directory if needed (recursively)
  bootstrapDirectory() {
    const folders = this.workspaceDirectory.split(path.sep)
    let curPath = ""
    for (let i = 0; i < folders.length; i++) {
      curPath += folders[i] + path.sep
      if (!fs.existsSync(curPath)) {
        fs.mkdirSync(curPath)
      }
    }
  }

  async bootstrap() {
    this.bootstrapDirectory()
    await this.settings.bootstrap()
  }

  saveAs(name) {
    this.name = name
    this.workspaceDirectory = Workspace.generateDirectory(this.name)
    this.bootstrapDirectory()
  }

  addProject(project) {
    this.projects.push(project)
  }

  getChainDatabase() {

  }
}

export default Workspace