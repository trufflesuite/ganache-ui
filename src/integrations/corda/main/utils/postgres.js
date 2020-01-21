const { Pool } = require("pg");
const fs = require("graceful-fs");
const { join } = require("path");
const { spawn } = require("promisify-child-process");
const temp = require("temp");
const { promisify } = require("util");
const mkdir = promisify(temp.mkdir.bind(temp));
const exists = promisify(fs.exists.bind(fs));

const USER = "ganache";
const DATA_DIR = "__ganache_pg_data_";
const config = {env: null, encoding: "utf8"};

module.exports = (POSTGRES_PATH) => {
  const pgJoin = join.bind(null, join(POSTGRES_PATH, "bin"));
  const INITDB = pgJoin("initdb");
  const PG_CTL = pgJoin("pg_ctl");
  const CREATEUSER = pgJoin("createuser");
  const CREATEDB = pgJoin("createdb");

  function getConnectedClient(database, port){
    let pool;
    const key = postgres._getClientPoolKey(database, port);
    if (!postgres.pools.has(key)){
      pool = new Pool({
        user: "postgres",
        host: "localhost",
        password: "",
        database,
        port
      });
      postgres.pools.set(key, pool);
    } else {
      pool = postgres.pools.get(key);
    }
    
    return pool.connect();
  }

  async function initSchema(port, schemaNames){
    try {
      const promises = [];
      // create the "ganache" user:
      const ganacheUserProm = spawn(CREATEUSER, ["--host", "127.0.0.1", "--port", port, "--createdb", "--username", "postgres", USER], config);

      // create the "corda" user
      promises.push(spawn(CREATEUSER, ["--host", "127.0.0.1", "--port", port, "--username", "postgres", "corda"], config));

      // create all of the databases for each node (these are owned by "ganache" so we have to wait till that user is created)
      ganacheUserProm.then(() => {
        schemaNames.forEach(schema => {
          promises.push(spawn(CREATEDB, ["--host", "127.0.0.1", "--port", port, "--owner", USER, "--username", USER, schema.safeName], config));
        })
      });
      await Promise.all(promises);
    } catch(e) {
      // if bad things happened, stop it
      await stop().catch(e => e);
      throw e;
    }
  }

  const postgres = {
    start: async (port, safeWorkspaceName, schemaNames, isTemp = false) => {
      let dataDir;
      let doesExist = false;

      if (isTemp) {
        temp.track();
        dataDir = await mkdir(DATA_DIR);
      } else {
        dataDir = join(safeWorkspaceName, DATA_DIR);
        doesExist = await exists(dataDir);
      }

      const stop = () => spawn(PG_CTL, ["stop" ,"-D", dataDir], config);

      if (doesExist) {
        try {
          await stop();
        } catch {
          // ignore. we'll try to continue to connect anyway...
        }
      } else {
        // initialize a postgres database
        await spawn(INITDB, ["--pgdata", dataDir, "--username", "postgres"], config);
      }

      // make sure there are no databases of ours running on this port...
      await postgres.stop(port);

      // TODO: figure out what postgres needs on Windows from the process.env and only supply that.
      // start the postgres server
      await spawn(PG_CTL, ["-o", `-F -p ${port}`, "-D", dataDir, "-l", join(dataDir, "postgres-logfile.log"), "-w", "start"]);
      
      await initSchema(port, schemaNames);

      let shuttingDown = false;
      return {
        dataDir,
        /**
         * Disconnects all clients and ends all pools before shutting the server down
         */
        shutdown: async () => {
          if (shuttingDown) return shuttingDown;
          shuttingDown = Promise.all(["postgres", ...schemaNames].map(async (database) => {
              const key = postgres._getClientPoolKey(database, port);
              let pool = postgres.pools.get(key);
              if (pool) {
                pool.on("error", () => {
                  // swallow pool errors when shutting down because
                  // they are probably caused by a connected client
                  // that _has_ been released but not fully disconnected.
                });
                postgres.pools.delete(key);
                await pool.end();
              }
            })).then(stop);
          return shuttingDown;
        },
        getConnectedClient
      }
    },
    pools: new Map(),
    _getClientPoolKey: (database, port) => {
      return `${database}:${port}`;
    },
    stop: async (port) => {
      let client;
      const key = postgres._getClientPoolKey("postgres", port);
      let res;
      try {
        client = await getConnectedClient("postgres", port);
        res = await client.query("show data_directory");
      } catch(e) {
        // if we are here it just means we don't have a db connected yet or we just can't connect to the database
        // that is running on this port :-/
        // eslint-disable-next-line no-console
        console.log(e);
      }
      finally {
        client && client.release();
        const pool = postgres.pools.get(key);
        postgres.pools.delete(key);
        pool && await pool.end();
      }

      if (res && res.rows && res.rows.length > 0) {
        const connectedDataDir = res.rows[0].data_directory;
        if (connectedDataDir.includes(DATA_DIR)) {
          try {
            await spawn(pgJoin("pg_ctl"), ["-D", connectedDataDir, "stop"], config);
          } catch(e) {
            // this shouldn't really happen, log juuussttt in case.
            // eslint-disable-next-line no-console
            console.error(e);
          }
        } else {
          throw new Error(`Cannot stop PostgreSQL database on 127.0.0.1:${port} at "${connectedDataDir}". Database is not owned by Ganache.`);
        }
      }
    }
  };
  return postgres;
};
