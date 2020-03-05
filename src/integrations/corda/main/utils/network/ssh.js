const node_ssh = require("node-ssh");

class SSH {
  constructor (port) {
    this.ssh = new node_ssh();
    this.port = port;
    this._status = "stopped";
    this.shell = null;
  }

  async requestShell(){
    this.shell = await this.ssh.requestShell();
  }

  async connect(requestShell = false){
    await this.ssh.connect({
      keepaliveInterval: 10000,
      host: "127.0.0.1",
      username: "user1",
      password: "letmein",
      port: this.port
    })
    if (requestShell) {
      await this.requestShell();
    }
    this._status = "started";
    return this.ssh;
  }

  hasConnection(){
    return this.ssh && this.ssh.connection;
  }

  write(data){
    this.shell.write(data);
  }

  on(...args){
    this.shell.on(...args);
  }

  once(...args){
    this.shell.once(...args);
  }

  gracefulShutdown(callback){
    this.ssh.connection.once("error", () => {
      // swallow the error
      // this shutdown command causes a disconnect from the corda
      // which results an error within the ssh connection logic.
    });
    this.ssh.exec("run", ["gracefulShutdown"]).catch(e => {
      // eslint-disable-next-line no-console
      console.error(e);
      // didn't seem to work... send SIGINT
      callback();
    });
  }

  disconnect(){
    this.ssh.dispose();
    this.ssh = new node_ssh();
    this.shell = null;
    this._status = "stopped";
  }

  status(){
    return this._status;
  }
}

module.exports = SSH;
