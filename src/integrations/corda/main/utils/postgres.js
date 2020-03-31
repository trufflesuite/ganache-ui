const { Pool } = require("pg");
const fs = require("graceful-fs");
const { join } = require("path");
const { spawn } = require("promisify-child-process");
const { promisify } = require("util");
const exists = promisify(fs.exists);

const USER = "ganache";
const config = {env: process.env, encoding: "utf8"};

module.exports = (POSTGRES_PATH) => {
  const pgJoin = join.bind(null, join(POSTGRES_PATH, "bin"));
  const INITDB = pgJoin("initdb");
  const PG_CTL = pgJoin("pg_ctl");
  const CREATEUSER = pgJoin("createuser");
  const CREATEDB = pgJoin("createdb");

  const POSTGRES_DATA_DIR = "__ganache__postgres_data";

  function getConnectedClient(database, port) {
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
      // swallow errors because we're (probably) just shutting down:
      pool.on("error", console.log);
      postgres.pools.set(key, pool);
    } else {
      pool = postgres.pools.get(key);
    }
    
    return pool.connect().then(client => {
      // swallow errors because we're (probably) just shutting down:
      client.on("error", console.log);
      return client;
    });
  }

  async function initSchema(port, schemaNames) {
    const promises = [];
    // create the "ganache" user:
    const ganacheUserProm = spawn(CREATEUSER, ["--host", "127.0.0.1", "--port", port, "--createdb", "--username", "postgres", USER], config).catch(e=>e);

    // create the "corda" user
    promises.push(spawn(CREATEUSER, ["--host", "127.0.0.1", "--port", port, "--username", "postgres", "corda"], config).catch(e=>e));

    // create all of the databases for each node (these are owned by "ganache" so we have to wait till that user is created)
    schemaNames.forEach(schema => {
      promises.push(ganacheUserProm.then(() => {
        return spawn(CREATEDB, ["--host", "127.0.0.1", "--port", port, "--owner", USER, "--username", USER, schema.safeName], config).catch(e=>e);
      }));
    });
    await Promise.all(promises);
  }

  const postgres = {
    start: async (port, safeWorkspaceName, schemaNames) => {
      const dataDir = join(safeWorkspaceName, POSTGRES_DATA_DIR);
      const doesExist = await exists(dataDir);

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
      const maxConnections = Math.min(Math.max(100, schemaNames.length * schemaNames.length), 10000);
      await spawn(PG_CTL, ["-o", `-F -p ${port} -N ${maxConnections}`, "-D", dataDir, "-l", join(dataDir, "postgres-logfile.log"), "-w", "start"]);
      
      try {
        await initSchema(port, schemaNames);
      } catch(e) {
        // if bad things happened, stop it
        await stop().catch(e => e);
        throw e;
      }

      let shuttingDown = false;
      return {
        dataDir,
        /**
         * Disconnects all clients and ends all pools before shutting the server down
         */
        shutdown: async () => {
          if (shuttingDown) return shuttingDown;
          shuttingDown = Promise.all(["postgres", ...schemaNames].map(async (database) => {
            return postgres.endPool(database, port);
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
    endPool: (database, port) => {
      const key = postgres._getClientPoolKey(database, port);
      let pool = postgres.pools.get(key);
      if (pool) {
        pool.on("error", () => {
          // swallow pool errors when shutting down because
          // they are probably caused by a connected client
          // that _has_ been released but not fully disconnected.
        });
        postgres.pools.delete(key);
        return pool.end();
      }
    },
    stop: async (port) => {
      let client;
      let res;
      try {
        client = await getConnectedClient("postgres", port);
        res = await client.query("show data_directory");
      } catch(e) {
        // if we are here it just means we don't have a db connected yet or we just can't connect to the database
        // that is running on this port :-/
      }
      finally {
        client && client.release();
        await postgres.endPool("postgres", port);
      }

      if (res && res.rows && res.rows.length > 0) {
        const connectedDataDir = res.rows[0].data_directory;
        if (connectedDataDir.includes(POSTGRES_DATA_DIR)) {
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
