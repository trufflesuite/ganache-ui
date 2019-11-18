const { existsSync } = require("fs");
const { join } = require("path");
const { spawnSync } = require("child_process");


module.exports = (POSTGRES_PATH) => {
  const pgJoin = (() => {
    const part = join(POSTGRES_PATH, "bin");  // Only compute once
    return (newpath) => join(part, newpath);
  })();
  return {
    start: (port, safeWorkspaceName, schemaNames) => {
      // stop it
      const dataDir = join(safeWorkspaceName, `__pg_data_`);
      const exists = existsSync(dataDir);

      if (exists) {
        try {
          spawnSync(pgJoin("pg_ctl"), ["-D", dataDir, "stop"], {env: null});
        } catch(e) {
          // ignore
        }
      } else {
        // config it
        spawnSync(pgJoin("initdb"), ["--pgdata", dataDir, "--username", "postgres"], {env: null});
      }

      // start it
      // console.log(`"${postgres_path}/bin/pg_ctl" -o "-F -p ${port}" -D "${dataDir}" -l logfile start -w`);
      spawnSync(pgJoin("pg_ctl"), ["-o", `-F -p ${port}`, "-D", dataDir, "-l", "logfile", "-w", "start"], {env: null});
      try {
        spawnSync(pgJoin("createuser"), ["--host", "127.0.0.1", "--port", port, "--createdb", "--username", "postgres", "ganache"], {env: null});
        spawnSync(pgJoin("createuser"), ["--host", "127.0.0.1", "--port", port, "--username", "postgres", "corda"], {env: null});
      } catch(e){
        // ignore
      }

      for (let i = 0, l = schemaNames.length; i < l; i++) {
        const schema = schemaNames[i];
        try {
          spawnSync(pgJoin("createdb"), ["--host", "127.0.0.1", "--port", schema.dbPort, "--owner", "ganache", "--username", "ganache", schema.safeName], {env: null});
        } catch(e) {
          // ignore
        }
      }

      return {
        stop: () => {
          return spawnSync(pgJoin("pg_ctl"), ["stop" ,"-D", dataDir], {env: null});
        }
      }
    }
  }
};
