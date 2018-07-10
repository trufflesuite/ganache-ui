import path from 'path'
import fs from 'fs'
import { app } from 'electron'
import Workspace from './Workspace'

class WorkspaceManager {
  constructor() {
    this.workspaces = []
  }

  enumerateWorkspaces() {
    const workspacesDirectory = path.join(app.getPath('userData'), 'workspaces')
    if (fs.existsSync(workspacesDirectory)) {
      this.workspaces = fs.readdirSync(workspacesDirectory).filter((file) => {
        return fs.lstatSync(path.join(workspacesDirectory, file)).isDirectory
      }).map((file) => {
        return new Workspace(path.basename(file))
      })
    }
  }

  async bootstrap() {
    this.enumerateWorkspaces()
    for (let i = 0; i < this.workspaces.length; i++) {
      await this.workspaces[i].bootstrap()
    }
  }

  getNames() {
    return this.workspaces.map((workspace) => workspace.name)
  }

  get(name) {
    return this.workspaces.find((workspace) => name === workspace.name)
  }
}

export default WorkspaceManager