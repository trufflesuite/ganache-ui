import path from 'path'
import fs from 'fs'
import { app } from 'electron'

import WorkspaceSettings from './Settings/WorkspaceSettings'

class Workspace {
  constructor(basename, projects) {
    this.basename = basename
    this.projects = projects || []
    this.workspaceDirectory = Workspace.generateDirectoryPath(this.basename)
    this.chaindataDirectory = path.join(this.workspaceDirectory, "chaindata")
    this.settings = new WorkspaceSettings(this.workspaceDirectory, this.chaindataDirectory)
  }

  static generateDirectoryPath(name) {
    if (name === "") {
      return path.join(app.getPath('userData'), 'default')
    }
    else {
      const sanitizedName = name.replace(/\s/g, '-').replace(/[^a-zA-Z0-9\-\_\.]/g, '')
      return path.join(app.getPath('userData'), 'workspaces', sanitizedName)
    }
  }

  async getName() {
    return await this.settings.get("name") || this.basename
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
    if (!fs.existsSync(this.chaindataDirectory)) {
      fs.mkdirSync(this.chaindataDirectory)
    }
  }

  async bootstrap() {
    this.bootstrapDirectory()
    await this.settings.bootstrap()
    this.name = await this.getName()
  }

  saveAs(name) {
    this.name = name
    this.workspaceDirectory = Workspace.generateDirectory(this.name)
    this.basename = path.basename(this.workspaceDirectory)
    this.bootstrapDirectory()
  }

  addProject(project) {
    this.projects.push(project)
  }
}

export default Workspace