import path from "path"
import fs from "fs"
import TruffleConfig from "truffle-config"

class TruffleProject {
  constructor(configPath) {
    this.configPath = configPath
    this.config = {}
    this.contracts = [];
  }

  bootstrap() {
    if (TruffleProject.checkValidProject(this.configPath)) {
      this.config = new TruffleConfig(path.dirname(this.configPath), path.dirname(this.configPath))
      const relativePath = path.relative(__dirname, this.configPath)
      const output = require(relativePath)
      this.config.merge(output)

      this.contracts = fs.readdirSync(this.config.contracts_build_directory)
        .filter((file) => file.endsWith(".json"))
        .map((file) => JSON.parse(fs.readFileSync(path.join(this.config.contracts_build_directory, file), "utf8")))
      return true
    }
    else {
      return false
    }
  }

  static checkValidProject(configPath) {
    const filename = path.basename(configPath)

    return filename === "truffle.js" || filename === "truffle-config.js"
  }
}

export default TruffleProject