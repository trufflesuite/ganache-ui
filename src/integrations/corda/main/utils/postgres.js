const { existsSync } = require("fs");
const { join } = require("path");
const { spawnSync } = require("child_process");

module.exports = (postgres_path = "../../../../../dist/extras/postgresql-9.6.15-2-linux-x64-binaries/bin") => {
  return {
    start: (port, safeWorkspaceName, schemaNames) => {
      // stop it
      const dataDir = join(__dirname, `__pg_data_${safeWorkspaceName}`)
      const exists = existsSync(dataDir);

      if (exists) {
        try {
          spawnSync(`${postgres_path}/pg_ctl`, ["-D", dataDir, "stop"]);
        } catch(e) {
          // ignore
        }
      }
      if (!exists) {
        // config it
        spawnSync(`${postgres_path}/initdb`, ["--pgdata", dataDir, "--username", "postgres"]);
      }

      // start it
      // console.log(`"${postgres_path}/pg_ctl" -o "-F -p ${port}" -D "${dataDir}" -l logfile start -w`);
      spawnSync(`${postgres_path}/pg_ctl`, ["-o", `-F -p ${port}`, "-D", dataDir, "-l", "logfile", "-w", "start"]);
      try {
        spawnSync(`${postgres_path}/createuser`, ["--host", "127.0.0.1", "--port", port, "--createdb", "--username", "postgres", "ganache"]);
        spawnSync(`${postgres_path}/createuser`, ["--host", "127.0.0.1", "--port", port, "--username", "postgres", "corda"]);
      } catch(e){
        // ignore
      }

      for (let i = 0, l = schemaNames.length; i < l; i++) {
        const schema = schemaNames[i];
        try {
          spawnSync(`${postgres_path}/createdb`, ["--host", "127.0.0.1", "--port", port, "--owner", "ganache", "--username", "ganache", schema]);
        } catch(e) {
          // ignore
        }
      }

      return {
        stop: () => {
          return spawnSync(`"${postgres_path}/pg_ctl"`, ["stop" ,"-D", dataDir]);
        }
      }
    }
  }
};
