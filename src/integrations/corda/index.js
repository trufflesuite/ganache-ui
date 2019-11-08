import Integrations from "../integrations";
import CordaChainService from "./common/services/CordaChainService";

class Corda extends Integrations {
    constructor(integrationManager) {
        super(integrationManager);
        this.chain = new CordaChainService(integrationManager.config);
    }
}

export default Corda;