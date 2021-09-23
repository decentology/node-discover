"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnicastNetwork = void 0;
const AbstractNetwork_1 = require("./AbstractNetwork");
const CreateDestination_1 = require("./CreateDestination");
class UnicastNetwork extends AbstractNetwork_1.AbstractNetwork {
    constructor(options) {
        super(options);
        this.destinations = null;
        this.networkOptions = {
            unicast: options.unicast,
        };
    }
    getDestinations() {
        if (!this.destinations) {
            let unicast = this.networkOptions.unicast;
            if (typeof unicast === "string" && ~unicast.indexOf(",")) {
                unicast = unicast.split(",");
            }
            this.destinations = [...unicast].map(CreateDestination_1.createDestination);
        }
        return this.destinations;
    }
}
exports.UnicastNetwork = UnicastNetwork;
//# sourceMappingURL=UnicastNetwork.js.map