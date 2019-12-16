const { existsSync } = require("fs");
const { join } = require("path");
const { spawnSync } = require("child_process");
const temp = require("temp");

const USER = "ganache";

module.exports = (POSTGRES_PATH) => {
  const pgJoin = (() => {
    const part = join(POSTGRES_PATH, "bin");  // Only compute once
    return (newpath) => join(part, newpath);
  })();
  return {
    start: (port, safeWorkspaceName, schemaNames, isTemp = false) => {
      let dataDir;
      let exists = false;

      if (isTemp) {
        temp.track();
        dataDir = temp.mkdirSync(`__pg_data_`);
      } else {
        dataDir = join(safeWorkspaceName, `__pg_data_`);
        exists = existsSync(dataDir);
      }

      if (exists) {
        try {
          // stop it
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
      // TODO: figure out what psotgres needs on Windows from the process.env and only supply that.
      spawnSync(pgJoin("pg_ctl"), ["-o", `-F -p ${port}`, "-D", dataDir, "-l", join(dataDir, "postgres-logfile.log"), "-w", "start"]);
      try {
        spawnSync(pgJoin("createuser"), ["--host", "127.0.0.1", "--port", port, "--createdb", "--username", "postgres", USER], {env: null});
        spawnSync(pgJoin("createuser"), ["--host", "127.0.0.1", "--port", port, "--username", "postgres", "corda"], {env: null});
      } catch(e){
        // ignore
      }

      for (let i = 0, l = schemaNames.length; i < l; i++) {
        const schema = schemaNames[i];
        try {
          spawnSync(pgJoin("createdb"), ["--host", "127.0.0.1", "--port", port, "--owner", USER, "--username", USER, schema.safeName], {env: null});
        } catch(e) {
          // ignore
        }
      }

      return {
        dataDir,
        stop: () => {
          return spawnSync(pgJoin("pg_ctl"), ["stop" ,"-D", dataDir], {env: null});
        }
      }
    }
  }
};
