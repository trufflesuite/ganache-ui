import EventEmitter from 'events'
import { fork } from 'child_process'
import path from 'path'
import cloneDeep from 'lodash.clonedeep'

// https://github.com/electron/electron/blob/cd0aa4a956cb7a13cbe0e12029e6156c3e892924/docs/api/process.md#process-object

class DecoderService extends EventEmitter {
  constructor() {
    super()
    this.child = null;
    this.setMaxListeners(1);
  }

  start() {
    let chainPath = path.join(__dirname, "../../decoder/", "index.js");
    const options = {
      stdio: [ 'pipe', 'pipe', 'pipe', 'ipc' ]
    };
    this.child = fork(chainPath, [], options);
    this.child.on('message', (message) => {
      if (message.type == "process-started") {
        this.emit("start");
      }
      this.emit(message.type, message.data);
    })
    this.child.on('error', (error) => {
      console.log(error);
      this.emit("error", error);
    })
    this.child.on('exit', this._exitHandler);
    this.child.stdout.on('data', (data) => {
      console.log(data.toString());
      // Remove all \r's and the final line ending
      this.emit("stdout", data.toString().replace(/\r/g, "").replace(/\n$/, ""));
    });
    this.child.stderr.on('data', (data) => {
      console.log(data.toString());
      // Remove all \r's and the final line ending
      this.emit("stderr", data.toString().replace(/\r/g, "").replace(/\n$/, ""));
    });
  }

  stopProcess() {
    if (this.child !== null) {
      this.child.removeListener('exit', this._exitHandler);
      if (this.child) {
        this.child.kill('SIGHUP');
      }
    }
  }

  _exitHandler(code, signal) {
    if (code != null) {
      this.emit("error", `Blockchain process exited prematurely with code '${code}', due to signal '${signal}'.`);
    } else {
      this.emit("error", `Blockchain process exited prematurely due to signal '${signal}'.`);
    }
  }

  async getProjectDetails(projectConfigFile) {
    return new Promise((resolve, reject) => {
      this.once("project-details-response", (details) => {
        if (typeof details === "object") {
          resolve(details);
        }
        else {
          reject(details);
        }
      })

      this.child.send({
        type: "project-details-request",
        data: projectConfigFile
      });
    });
  }
}

export default DecoderService;
