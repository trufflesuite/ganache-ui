import Integrations from "../integrations";
import CordaChainService from "./common/services/CordaChainService";
import CordAppIntegrationService from "./common/services/CordAppIntegrationService";

class Corda extends Integrations {
    constructor(integrationManager) {
        super(integrationManager);

        this.projectIntegration = new CordAppIntegrationService();
        this.chain = new CordaChainService(integrationManager.config);
        this.chain.on("message", this.emit.bind(this, "message"));
    }
}

export default Corda;
