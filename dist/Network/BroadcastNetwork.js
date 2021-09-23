"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BroadcastNetwork = void 0;
const AbstractNetwork_1 = require("./AbstractNetwork");
const CreateDestination_1 = require("./CreateDestination");
class BroadcastNetwork extends AbstractNetwork_1.AbstractNetwork {
    constructor(options = {}) {
        super(options);
        this.destinations = null;
        this.networkOptions = {
            broadcast: options.broadcast || "255.255.255.255",
        };
    }
    start(callback) {
        super.start(() => {
            const socket = this.getSocket();
            socket.setBroadcast(true);
            callback && callback(null);
        });
    }
    getDestinations() {
        if (!this.destinations) {
            //TODO: get the default broadcast address from os.networkInterfaces() (not currently returned)
            this.destinations = [this.networkOptions.broadcast || "255.255.255.255"].map(CreateDestination_1.createDestination);
        }
        return this.destinations;
    }
}
exports.BroadcastNetwork = BroadcastNetwork;
//# sourceMappingURL=BroadcastNetwork.js.map