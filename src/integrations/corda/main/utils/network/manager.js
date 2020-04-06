const os = require('os')
const crypto = require('crypto');
const temp = require("temp");
const { promisify } = require("util");
const mkdir = promisify(temp.mkdir);
const { CordaBootstrap } = require("./bootstrap");
const { EventEmitter } = require("events");
const { basename, join } = require("path");
const postgres = require("../postgres");
const Braid = require("./braid");
const CordaNode = require("./corda-node");
const fse = require("fs-extra");
const fetch = require("node-fetch");
const GetPort = require("get-port");
const chokidar = require('chokidar');
const BlobInspector = require("./blob-inspector");
const { REFRESH_CORDAPP, sendRefreshCordapp } = require("../../../../../common/redux/corda-core/actions");
const { SSH_DATA, CLEAR_TERM } = require("../../../../../common/redux/cordashell/actions");
const CORDAPP_DELAY = 1000;

const chunk = (arr, size) => Array.from({
  length: Math.ceil(arr.length / size)
}, (v, i) => arr.slice(i * size, i * size + size));

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
    this.sendSSHData = this.createMsgEmitter("send", SSH_DATA);
    this.sendClearTerm = this.createMsgEmitter("send", CLEAR_TERM);
    this.sendRefreshCordapps = this.createMsgEmitter("send", REFRESH_CORDAPP);
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
    const isTemp = this.settings.isDefault;
    if (isTemp) {
      temp.track();
      this.chaindataDirectory = mkdir(`__ganache_${CHAIN_DATA}_`);
    } else {
      const dir = join(workspaceDirectory, CHAIN_DATA);
      this.chaindataDirectory = Promise.resolve(dir);
    }

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
      this._downloadPromise = this.config.corda.downloadRequired();
      const chainDataDir = await this.chaindataDirectory;

      const BRAID_HOME = this.config.corda.files.braidServer.download();
      const POSTGRES_HOME = this.config.corda.files.postgres.download();
      const POSTGRES_DRIVER = this.config.corda.files.cordaDrivers.download();
      this._io.sendProgress("Writing configuration files...");
      const cordaBootstrap = new CordaBootstrap(chainDataDir, this._io);
      const { nodesArr, notariesArr } = await cordaBootstrap.writeConfig(nodes, notaries, postgresPort, await POSTGRES_DRIVER);
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
      this._io.sendProgress("Bootstrapping network...");
      if (this.settings.runBootstrap) {
        await cordaBootstrap.bootstrap(this.config);
        this.settings.runBootstrap = this.settings.name === "Quickstart";
      } else {
        this._io.sendProgress("Skipping; network already bootstrapped.", 250);
      }
      if (this.cancelled) return;
      this._io.sendProgress("Configuring Postgres Hooks...", 0);
      this.postGresHooksPromise = this.setupPostGresHooks();
      this._io.sendProgress("Copying Cordapps...", 500);
      await Promise.all([
        this.copyCordappsAndSetupNetwork(),
        this.postGresHooksPromise,
        this.hashCordapps(),
        this.addCordappListeners()
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
    const jars = this.settings.jars || [];
    const cordappHashMap = this.settings.cordappHashMap || {};
    const promises = jars.map(path => {
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

  addCordappListeners(){
    if (this.allProjects) {
      this.watcher = chokidar.watch([...this.allProjects]);
      const listener = () => {
        if (this.cordappWatcher) {
          clearTimeout(this.cordappWatcher);
        }
        // start timer
        this.cordappWatcher = setTimeout(() => {
          // alert user
          this._io.sendRefreshCordapps(sendRefreshCordapp());
        }, CORDAPP_DELAY);
      };
      const unlinkDirListener = (path) => {
        // check if the root project exists
        if (fse.existsSync(join(path, "../../"))) {
          // if it exists ensuredir
          // fse.ensureDirSync(path);
        } else {
          // if it doesnt - stop watching this dir
          this.watcher.unwatch(path);
        }
        listener();
      };
      const unlinkListener = (path) => {
        // file must be a .jar we've already validated
        // check if the directory exists
        const jarRoot = join(path, "..");
        if (!fse.existsSync(jarRoot)) {
          // if it doesnt - stop watching this dir
          this.watcher.unwatch(path);
        }
        listener();
      };
      this.watcher.on("ready", () => {
        this.watcher.on("add", listener);
        this.watcher.on("change", listener);
        this.watcher.on("unlink", unlinkListener);
        this.watcher.on("unlinkDir", unlinkDirListener);
      });
    }
  }

  async copyCordappsAndSetupNetwork() {
    // TODO this has become a mess. Spend some time to do it right one day :-D
    const promises = [];
    const networkMap = new Map();
    const chaindataDir = await this.chaindataDirectory;
    this.allProjects = new Set();
    this.entities.forEach((node) => {
      // track all entities' ports in a port blacklist so we don't try to bind 
      // braid to it later.
      this.addToBlackList(node);

      
      const currentDir = join(chaindataDir, node.safeName, "cordapps");
      try {
        fse.removeSync(currentDir);
      } catch(e) {
        // ignore
        console.log(e);
      }

      // copy all cordapps where they are supposed to go
      node.jars = (node.projects || []).flatMap(path => {
        if (!fse.existsSync(path)) {
          return [];
        }
        const stat = fse.statSync(path);
        if (stat.isDirectory()) { // SANITY CHECK
          // check for build.gradle
          const buildGradle = join(path, "build.gradle");
          if (fse.existsSync(buildGradle)) {
            if (fse.readFileSync(buildGradle).toString().includes("corda")) {
              // get or make build/libs/
              const buildLibs = join(path, "build/libs");
              fse.ensureDirSync(buildLibs);
              // add to list for chokidar
              this.allProjects.add(buildLibs);
              // add all jars in list
              
              return fse.readdirSync(buildLibs).reduce((arr, jar) => {
                const jarPath = jar.toLowerCase();
                if (jarPath.endsWith(".jar")) {
                  arr.push(join(buildLibs, jarPath));
                }
                return arr;
              }, []);
            }
          }
          this.allProjects.add(path);
          const files = fse.readdirSync(path);
          return files.reduce((arr, curr) => {
            const fName = join(path, curr);
            if (fName.endsWith(".jar")) {
              arr.push(fName);
            }
            return arr;
          }, []);
        }
        throw `Path must point to a directory:  ${path}`;
      });

      // go brr
      node.jars.forEach(path => {
        const name = basename(path);
        const newPath = join(currentDir, name);
        promises.push(fse.copy(path, newPath));
      });
    });
    this.settings.jars = [... new Set(this.entities.flatMap(node => node.jars))];
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
    // we're working around 2 limitations here: CPU and Memory...
    // CPU: use up to 3/4 of the user's CPUs to start their corda nodes,
    //  but no fewer than 2 at a time.
    // Memory: A node at rest consumes about .6-.9 GB of memory, a node during
    // start up can consume up to 2GB of memory
    const chunkSize = Math.max(2, Math.floor(os.cpus().length * .75));
    const chunks = chunk(entities, chunkSize);
    const NODE_STARTUP_USAGE = 2000000000;
    
    for (var i = 0; i < chunks.length; i++) {
      const freeMemory = os.freemem(); // bytes
      const size = Math.max(1, Math.floor(freeMemory / NODE_STARTUP_USAGE));
      const subChunks = chunk(chunks[i], size);
      for (var j = 0; j < subChunks.length; j++) {
        const promises = subChunks[j].map(async (entity) => {
          const currentPath = join(chaindataDir, entity.safeName);
          // eslint-disable-next-line require-atomic-updates
          entity.braidPort = await this.getPort(entity.rpcPort + 10000);
          if (this.cancelled) return;
          const braidPromise = this.braid.start(entity, currentPath, JAVA_HOME);
          entity.version = entity.version || "4_4";
          if (!this.config.corda.files[`corda${entity.version}`]) {
            entity.version = "4_4";
          }
          const CORDA_HOME = await this.config.corda.files[`corda${entity.version}`].download();
          const corda = new CordaNode(entity, currentPath, JAVA_HOME, CORDA_HOME, this._io);
          this.processes.push(corda);
          const cordaProm = corda.start().then(() => {
            this._io.sendProgress(`Corda node ${++startedNodes}/${entities.length} online...`);
          });
          await Promise.all([cordaProm, braidPromise]);
          if (this.cancelled) return;
          // we need to get the `owningKey` for this node so we can reference it in the front end
          // eslint-disable-next-line require-atomic-updates
          entity.owningKey = await this.getOwningKey(entity);
        });
        
        await Promise.all(promises);
        if (this.cancelled) return;
      }
    }

    // _downloadPromise was started long ago, we just need to make sure all
    //  deps are downloaded before we start up.
    this._io.sendProgress(`Downloading remaining Corda dependencies...`, 0);
    this.blobInspector = new BlobInspector(JAVA_HOME, await this.config.corda.files.blobInspector.download());
    await this._downloadPromise;
  }

  // on slow machines or just big networks braid requests will sometimes timeout
  // so we create retry for a bit
  async getOwningKey(entity, attempt = 0){
    try {
      return fetch("https://localhost:" + entity.braidPort + "/api/rest/network/nodes/self", { agent })
            .then(r => r.json())
            .then(self => self.legalIdentities[0].owningKey)
    } catch(e) {
      if (attempt > 10 || this.cancelled) {
        throw e;
      } else {
        attempt++;
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            this.getOwningKey(entity, attempt).then(resolve).catch(reject);
          }, attempt * 1000); // backoff
        });
      }
    }
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
