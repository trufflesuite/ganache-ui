const node_ssh = require("node-ssh");

class SSH {
  constructor (port) {
    this.port = port;
    this._status = "stopped";
    this.shell = null;
  }

  async requestShell(){
    this.shell = await this.ssh.requestShell();
    this.shell.on("close", () => {
      this.shell = null;
    })
  }

  async connect(requestShell = false){
    // eslint-disable-next-line no-async-promise-executor
    return this.connectingPromise = new Promise(async (resolve, reject) => {
      try {
        if (!this.ssh) {
          this.ssh = new node_ssh();
        }
        if (this._status === "stopped") {
          await this.ssh.connect({
            keepaliveInterval: 10000,
            host: "127.0.0.1",
            username: "user1",
            password: "letmein",
            port: this.port
          })
          this.ssh.connection.on("end", () => {
            this._status = "stopped";
          })
        }
        if (requestShell && !this.shell) {
          await this.requestShell();
        }
        this._status = "started";
      } catch(e){
        reject(e);
        return;
      }

      resolve(this.ssh);
    });
  }

  hasConnection(){
    return this.ssh && this.ssh.connection;
  }

  write(data){
    this.shell.write(data);
  }

  onData(listener){
    this.shell.on("data", listener);
  }

  resize(data){
    if (this.shell && !this.shell.setWindow(data.rows, data.cols)) { // setup initial window size
      // Returns false if we should wait for the continue event before sending more traffic.
      return new Promise( resolve => this.once('continue', resolve));
    }
  }

  on(token, listener){
    this.shell && this.shell.on(token, listener);
  }

  once(token, listener){
    this.shell.once(token, listener);
  }

  gracefulShutdown(callback){
    this.ssh.connection.once("error", () => {
      // swallow the error
      // this shutdown command causes a disconnect from corda
      // which results an error within the ssh connection logic.
    });
    this.ssh.execCommand("run gracefulShutdown").catch(e => {
      // eslint-disable-next-line no-console
      console.error(e);
      // didn't seem to work... send SIGINT
      callback();
    });
  }

  async disconnect(){
    this.connectingPromise && await this.connectingPromise;
    if (this.shell) {
      this.shell.removeAllListeners();
      this.shell = null;
    }
    if (this.ssh && this.ssh.removeAllListeners) {
      this.ssh.removeAllListeners();
      this.ssh.dispose();
    }
    this._status = "stopped";
  }

  status(){
    return this._status;
  }
}

module.exports = SSH;
