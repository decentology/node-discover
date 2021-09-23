"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MulticastNetwork = void 0;
const AbstractNetwork_1 = require("./AbstractNetwork");
const CreateDestination_1 = require("./CreateDestination");
class MulticastNetwork extends AbstractNetwork_1.AbstractNetwork {
    constructor(options) {
        super(options);
        this.destinations = null;
        this.networkOptions = {
            multicast: options.multicast,
            multicastTTL: options.multicastTTL || 1,
        };
    }
    start(callback) {
        super.start(() => {
            const socket = this.getSocket();
            try {
                // addMembership can throw if there are no interfaces available
                socket.addMembership(this.networkOptions.multicast);
                socket.setMulticastTTL(this.networkOptions.multicastTTL);
            }
            catch (error) {
                this.emit("error", error);
                return callback && callback(error);
            }
        });
    }
    getDestinations() {
        if (!this.destinations) {
            this.destinations = [this.networkOptions.multicast].map(CreateDestination_1.createDestination);
        }
        return this.destinations;
    }
}
exports.MulticastNetwork = MulticastNetwork;
//# sourceMappingURL=MulticastNetwork.js.map