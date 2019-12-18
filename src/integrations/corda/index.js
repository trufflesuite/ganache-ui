import Integrations from "../integrations";
import CordaChainService from "./common/services/CordaChainService";
import CordAppIntegrationService from "./common/services/CordAppIntegrationService";

import bs58 from "bs58";

function convertTxHashToId(txhash) {
  return bs58.decode(txhash).toString("hex").toUpperCase();
}

class Corda extends Integrations {
    constructor(integrationManager) {
        super(integrationManager);

        this.projectIntegration = new CordAppIntegrationService();
        this.chain = new CordaChainService(integrationManager.config);
        this.chain.on("message", this.emit.bind(this, "message"));
        this.chain.on("error", this.send.bind(this, "error"));

        this._listen();
    }

    async _listen() {
        this.ipc.on("CORDA_REQUEST_TRANSACTION", async (_event, txhash) => {
            let data = null;
            const postgresClients = await this.chain.manager.postGresHooksPromise;
            for (let client of postgresClients) {
                const txId = convertTxHashToId(txhash);
                const result = await client.query("SELECT lo_get(transaction_value) AS data FROM node_transactions WHERE tx_id = $1::text LIMIT 1", [txId]);
                if (result.rows.length > 0) {
                    const dataBuffer = result.rows[0].data;
                    if (dataBuffer) {
                        data = await this.chain.manager.blobInspector.inspect(dataBuffer);
                        // the first line is the java/Corda class name, which
                        // we don't care about
                        const firstNewline = data.indexOf(0x0a); // 0x0a === \n
                        if (firstNewline !== -1) {
                            const dataStr = data.slice(firstNewline + 1);
                            try {
                                data = JSON.parse(dataStr);
                            } catch (e) {
                                this.chain.emit("error", e);
                                console.error(e);
                            }
                        }
                    }
                    break;
                }
            }

            this.ipc.emit("CORDA_TRANSACTION_DATA", txhash, data);
        });
    }
}

export default Corda;
