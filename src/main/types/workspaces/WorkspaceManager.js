import path from 'path'
import fs from 'fs'
import { app } from 'electron'
import Workspace from './Workspace'
import WorkspaceSettings, { DEFAULT_WORKSPACE_NAME } from '../settings/WorkspaceSettings'

class WorkspaceManager {
  constructor() {
    this.workspaces = []
  }

  async enumerateWorkspaces() {
    const workspacesDirectory = path.join(app.getPath('userData'), 'workspaces')
    if (fs.existsSync(workspacesDirectory)) {
      this.workspaces = fs.readdirSync(workspacesDirectory).filter((file) => {
        return fs.lstatSync(path.join(workspacesDirectory, file)).isDirectory
      }).map(async (file) => {
        let settings = new WorkspaceSettings(path.join(workspacesDirectory, file), path.join(workspacesDirectory, file, "chaindata"))
        await settings.bootstrap()
        const name = await settings.get("name")
        return new Workspace(name)
      })

      this.workspaces = await Promise.all(this.workspaces)
    }

    this.workspaces.push(new Workspace(DEFAULT_WORKSPACE_NAME))
  }

  async bootstrap() {
    await this.enumerateWorkspaces()
    for (let i = 0; i < this.workspaces.length; i++) {
      await this.workspaces[i].bootstrap()
    }
  }

  getNonDefaultNames() {
    return this.workspaces
      .filter((workspace) => workspace.name !== DEFAULT_WORKSPACE_NAME)
      .map((workspace) => workspace.name)
  }

  get(name) {
    return this.workspaces.find((workspace) => name === workspace.name)
  }
}

export default WorkspaceManager