import Integrations from "../integrations";
import CordaChainService from "./common/services/CordaChainService";

class Corda extends Integrations {
    constructor(integrationManager) {
        super(integrationManager);
        this.chain = new CordaChainService(integrationManager.config);
        this.chain.on("message", this.emit.bind(this, "message"));
    }
}

export default Corda;