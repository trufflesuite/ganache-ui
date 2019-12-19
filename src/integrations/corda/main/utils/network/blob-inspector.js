const { spawn } = require("child_process");
const { join } = require("path");
const temp = require("temp").track();
const { writeFile } = require("fs-extra");

module.exports = class BlobInspector {
  constructor(JAVA_HOME, BLOB_INSPECTOR) {
    this.JAVA_HOME = JAVA_HOME;
    this.BLOB_INSPECTOR = BLOB_INSPECTOR;
  }

  async inspect(buf) {
    const tmpDest = temp.path();
    await writeFile(tmpDest, buf);
    this.java = spawn(join(this.JAVA_HOME, "bin", "java"), ["-jar", this.BLOB_INSPECTOR, "--format", "JSON", tmpDest], { cwd: this.path, env: null });

    this.java.stderr.on('data', (data) => {
      this._io.sendStdErr(data);
      console.error(`blob stderr:\n${data}`);
    });

    let data = Buffer.from([]);
    this.java.stdout.on('data', (stdout) => {
      data = Buffer.concat([data, stdout], data.length + stdout.length);
    });

    this.java.on("error", console.error);

    return new Promise((resolve) => {
      const closeHandler = async (code) => {
        console.log(code);
        resolve(data);
      }
      this.java.once("close", closeHandler);
    });
  }
}
