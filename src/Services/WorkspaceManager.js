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
        return fs.lstatSync(file).isDirectory
      }).map((workspacePath) => {
        return new Workspace(path.basename(workspacePath))
      })
    }
  }
}

export default WorkspaceManager