const crypto = require('crypto');
const { CordaBootstrap } = require("./bootstrap");
const { EventEmitter } = require("events");
const { basename, join } = require("path");
const postgres = require("../postgres");
const Braid = require("./braid");
const Corda = require("./corda");
const fse = require("fs-extra");
const fetch = require("node-fetch");
const GetPort = require("get-port");
const BlobInspector = require("./blob-inspector");

const https = require("https");
const agent = new https.Agent({
  rejectUnauthorized: false
});
class IO {
  constructor(context) {
    this._context = context;
    this._init();
  }

  _init(){
    this.sendProgress = this.createMsgEmitter("progress");
    this.sendError = this.createMsgEmitter("error");
    this.sendStdErr = this.createMsgEmitter("stderr");
    this.sendStdOut = this.createMsgEmitter("stdout");
  }

  createMsgEmitter(...token){
    return this._context.emit.bind(this._context, "message", ...token);
  }

  emit(token, ...args){
    this._context.emit.call(this._context, "message", token, ...args);
  }
}

class NetworkManager extends EventEmitter {
  constructor(config, settings, workspaceDirectory) {
    super();
    this.config = config;
    this.settings = settings;
    const CHAIN_DATA = "chaindata";
    const dir = join(workspaceDirectory, CHAIN_DATA);
    this.chaindataDirectory = Promise.resolve(dir);

    this.nodes = [];
    this.notaries = [];
    this.processes = [];
    this._io = new IO(this);
    this.postGresHooksPromise = null;
    this.blacklist = new Set();
    this._downloadPromise = null;
    this.blobInspector = null;
    this.cancelled = false;
  }

  async bootstrap(nodes, notaries, postgresPort) {
    try {
      // kick off downloading all the things ASAP! this is safe to do because
      // each individual file that is downloaded is a singleton, returning the
      // same promise for each file request, or it just resolves immediately if
      // the file is already downloaded
      this._downloadPromise = this.config.corda.downloadAll();
      const chainDataDir = await this.chaindataDirectory;

      const BRAID_HOME = this.config.corda.files.braidServer.download();
      const POSTGRES_HOME = this.config.corda.files.postgres.download();
      this._io.sendProgress("Writing configuration files...");
      const cordaBootstrap = new CordaBootstrap(chainDataDir, this._io);
      const { nodesArr, notariesArr } = await cordaBootstrap.writeConfig(nodes, notaries, postgresPort);
      if (this.cancelled) return;
      this.nodes = nodesArr;
      this.notaries = notariesArr;
      this.entities = this.nodes.concat(this.notaries);
      this._io.sendProgress("Downloading PostgreSQL (this may take a few minutes)...", 0);
      const pgDownload = postgres(await POSTGRES_HOME);
      if (this.cancelled) return;
      this._io.sendProgress("Starting PostgreSQL...");
      this.pg = await pgDownload.start(postgresPort, chainDataDir, this.entities);
      if (this.cancelled) return;
      if (this.settings.runBootstrap) {
        this._io.sendProgress("Bootstrapping network...");
        await cordaBootstrap.bootstrap(this.config);
        this.settings.runBootstrap = this.settings.name === "Quickstart";
      } else {
        this._io.sendProgress("Skipping; network already bootstrapped.", 250);
      }
      if (this.cancelled) return;
      this._io.sendProgress("Configuring Postgres Hooks...", 0);
      this.postGresHooksPromise = this.setupPostGresHooks();
      this._io.sendProgress("Copying Cordapps...", 500);
      await this.copyCordappsAndSetupNetwork();
      await Promise.all([
        this.postGresHooksPromise,
        this.hashCordapps()
      ]);
      if (this.cancelled) return;
      this._io.sendProgress("Configuring RPC Manager...");
      this.braid = new Braid(join(await BRAID_HOME, ".."), this._io);
    } catch (e) {
      // if this manager was stopped we don't care about errors anymore
      if (this.cancelled) return;
      throw e;
    }
  }

  async hashCordapps(){   
    const projects = this.settings.projects || [];
    const cordappHashMap = this.settings.cordappHashMap || {};
    const promises = projects.map((path) => {
      return new Promise((resolve => {
        const sha256 = crypto.createHash("sha256");
        const fileStream = fse.ReadStream(path);
        fileStream.on("data", (data) => {
          sha256.update(data);
        });
        fileStream.on("end", () => {
          const hash = sha256.digest("hex");
          const htf = new Set(cordappHashMap[hash] || []);
          htf.add(path);
          cordappHashMap[hash.toUpperCase()] = [...htf];
          resolve();
        });
      }));
    });
    await Promise.all(promises);
    this.settings.cordappHashMap = cordappHashMap;
  }

  setupPostGresHooks() {
    return Promise.all(this.entities.map(async entity => {
      const client = await this.pg.getConnectedClient(entity.safeName, this.settings.postgresPort);
      if (this.cancelled) return client;

      await client.query(`create or replace function notify_subscribers()
          returns trigger
          language plpgsql
        AS $$
        begin
          PERFORM pg_notify('my_events', '');
          return null;
        end
        $$;
    
        DROP TRIGGER IF EXISTS mytrigger on public.vault_states;
    
        CREATE TRIGGER mytrigger
        AFTER INSERT OR UPDATE ON vault_states
        FOR EACH ROW
        EXECUTE PROCEDURE notify_subscribers();`);

      // Listen for all pg_notify channel messages
      client.on("notification", (msg) => {
        this.emit("message", "send", "VAULT_DATA", msg);
      });
      if (this.cancelled) return client;

      await client.query("LISTEN my_events");

      return client;
    }));
  }
  addToBlackList = (node) => {
    this.blacklist.add(node.rpcPort);
    this.blacklist.add(node.adminPort);
    this.blacklist.add(node.sshdPort);
    this.blacklist.add(node.p2pPort);
  }
  async copyCordappsAndSetupNetwork() {
    // TODO this has become a mess. Spend some time to do it right one day :-D
    const promises = [];
    const networkMap = new Map();
    const chaindataDir = await this.chaindataDirectory;
    this.entities.forEach((node) => {
      // track all entities' ports in a port blacklist so we don't try to bind 
      // braid to it later.
      this.addToBlackList(node);

      // copy all cordapps where they are supposed to go
      const currentDir = join(chaindataDir, node.safeName);
      (node.cordapps || []).forEach(async (path) => {
        const name = basename(path);
        const newPath = join(currentDir, "cordapps", name);
        fse.copySync(path, newPath);
      });
    });
    // for each notary, get it's node info file
    const notaryInfoFileNames = this.notaries.map((node) => {
      const currentDir = join(chaindataDir, node.safeName);
      return fse.readdirSync(currentDir).filter(file => file.startsWith("nodeInfo-")).reduce((p, name) => name, "");
    });
    // for each node
    this.nodes.forEach((node) => {
      const currentDir = join(chaindataDir, node.safeName);
      const info = fse.readdirSync(currentDir).filter(file => file.startsWith("nodeInfo-")).reduce((p, name) => name, "");
      const knownNodesDir = join(currentDir, "additional-node-infos");
      const currentlyKnownNodes = fse.readdirSync(knownNodesDir).map(file => ({ file, path: join(knownNodesDir, file) }));
      networkMap.set(node.safeName, { nodes: node.nodes || [], info, currentlyKnownNodes });
    });
    networkMap.forEach((val, _key, nMap) => {
      const nodes = val.nodes.map((node) => nMap.get(node)).filter(n => n).map(n => n.info);
      const needed = new Set([val.info, ...nodes]);
      val.currentlyKnownNodes.forEach(node => {
        // if the file is a notary file we need it. so keep it!
        if (notaryInfoFileNames.includes(node.file)) {
          return;
        }
        // if the file isn't one of the ones we are supposed to have, toss it!
        if (!needed.has(node.file)) {
          promises.push(fse.remove(node.path));
        }
      });
    });
    return Promise.all(promises);
  }

  async getPort(port) {
    while (this.blacklist.has(port)) port++;
    do {
      port = await GetPort({ port });
    } while (this.blacklist.has(port) && port++);
    this.blacklist.add(port);
    return port;
  }

  async start() {
      const chaindataDir = await this.chaindataDirectory;
      const entities = this.entities;
      this._io.sendProgress("Loading JRE...");
      const JAVA_HOME = await this.config.corda.files.jre.download();
      if (this.cancelled) return;

      this._io.sendProgress("Starting Corda Nodes...");
      let startedNodes = 0;
      const promises = entities.map(async (entity) => {
        const currentPath = join(chaindataDir, entity.safeName);
        // eslint-disable-next-line require-atomic-updates
        entity.braidPort = await this.getPort(entity.rpcPort + 10000);
        if (this.cancelled) return;
        const braidPromise = this.braid.start(entity, currentPath, JAVA_HOME);
        entity.version = entity.version || "4_3";
        const corda = new Corda(entity, currentPath, JAVA_HOME, this._io);
        this.processes.push(corda);
        const cordaProm = corda.start().then(() => {
          this._io.sendProgress(`Corda node ${++startedNodes}/${entities.length} online...`);
        });
        await Promise.all([cordaProm, braidPromise]);
        if (this.cancelled) return;
        // we need to get the `owningKey` for this node so we can reference it in the front end
        // eslint-disable-next-line require-atomic-updates
        entity.owningKey = await fetch("https://localhost:" + entity.braidPort + "/api/rest/network/nodes/self", { agent })
          .then(r => r.json())
          .then(self => self.legalIdentities[0].owningKey);
      });

    await Promise.all(promises);
    if (this.cancelled) return;

    // _downloadPromise was started long ago, we just need to make sure all
    //  deps are downloaded before we start up.
    this._io.sendProgress(`Downloading remaining Corda dependencies...`, 0);
    this.blobInspector = new BlobInspector(JAVA_HOME, await this.config.corda.files.blobInspector.download());
  }

  async stop() {
    this.cancelled = true;
    const promises = this.processes.map(cordaProcess => cordaProcess.stop());

    if (this.braid) {
      promises.push(this.braid.stop());
    }

    // wait until braid and corda are stopped
    await Promise.all(promises);

    // then shut down all the postgress stuff...
    if (this.postGresHooksPromise) {
      try {
        const pgHookProm = this.postGresHooksPromise;
        this.postGresHooksPromise = null;
        const postGresHooksClients = await pgHookProm;
        postGresHooksClients && await Promise.all(postGresHooksClients.map(client => client.end()));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Error occured while attempting to stop postgres clients...", e);
      }
    }
    try {
      this.pg && await this.pg.shutdown();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Error occured while attempting to stop postgres...", e);
    }
  }

  getNodes() {
    return this.nodes;
  }

  getNotaries() {
    return this.notaries;
  }
}

module.exports = NetworkManager;
