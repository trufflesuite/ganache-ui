import path from 'path'
import fse from 'fs-extra'

import WorkspaceSettings from '../settings/WorkspaceSettings'
import TruffleProject from './TruffleProject'

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
    this.workspaceDirectory = Workspace.generateDirectoryPath(this.name, configDirectory)
    this.basename = path.basename(this.workspaceDirectory)
    this.chaindataDirectory = this.generateChaindataDirectory()
  }

  static generateDirectoryPath(name, configDirectory) {
    if (name === null) {
      return path.join(configDirectory, 'default')
    }
    else {
      const sanitizedName = name.replace(/\s/g, '-').replace(/[^a-zA-Z0-9\-\_\.]/g, '')
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

  bootstrapProjects() {
    const projects = this.settings.get("projects")

    this.projects = projects.map(async (project) => {
      const truffleProject = new TruffleProject(project)
      truffleProject.bootstrap()
      return truffleProject
    })

    this.projects = Promise.all(this.projects)
  }

  bootstrap() {
    this.bootstrapDirectory()
    this.settings.bootstrap()
    this.bootstrapProjects()
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