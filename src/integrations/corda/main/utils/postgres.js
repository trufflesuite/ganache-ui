const { existsSync } = require("fs");
const { join } = require("path");
const { spawnSync } = require("child_process");

module.exports = (POSTGRES_PATH) => {
  return {
    start: (port, safeWorkspaceName, schemaNames) => {
      // stop it
      const dataDir = join(safeWorkspaceName, `__pg_data_`);
      const exists = existsSync(dataDir);

      if (exists) {
        try {
          spawnSync(`${POSTGRES_PATH}/bin/pg_ctl`, ["-D", dataDir, "stop"]);
        } catch(e) {
          // ignore
        }
      } else {
        // config it
        spawnSync(`${POSTGRES_PATH}/bin/initdb`, ["--pgdata", dataDir, "--username", "postgres"]);
      }

      // start it
      // console.log(`"${postgres_path}/bin/pg_ctl" -o "-F -p ${port}" -D "${dataDir}" -l logfile start -w`);
      spawnSync(`${POSTGRES_PATH}/bin/pg_ctl`, ["-o", `-F -p ${port}`, "-D", dataDir, "-l", "logfile", "-w", "start"]);
      try {
        spawnSync(`${POSTGRES_PATH}/bin/createuser`, ["--host", "127.0.0.1", "--port", port, "--createdb", "--username", "postgres", "ganache"]);
        spawnSync(`${POSTGRES_PATH}/bin/createuser`, ["--host", "127.0.0.1", "--port", port, "--username", "postgres", "corda"]);
      } catch(e){
        // ignore
      }

      for (let i = 0, l = schemaNames.length; i < l; i++) {
        const schema = schemaNames[i];
        try {
          spawnSync(`${POSTGRES_PATH}/bin/createdb`, ["--host", "127.0.0.1", "--port", port, "--owner", "ganache", "--username", "ganache", schema]);
        } catch(e) {
          // ignore
        }
      }

      return {
        stop: () => {
          return spawnSync(`"${POSTGRES_PATH}/bin/pg_ctl"`, ["stop" ,"-D", dataDir]);
        }
      }
    }
  }
};
