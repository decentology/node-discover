"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoLeadershipElection = void 0;
const AbstractLeadershipElection_1 = require("./AbstractLeadershipElection");
class NoLeadershipElection extends AbstractLeadershipElection_1.AbstractLeadershipElection {
    check() {
    }
    helloReceived(node, message, rinfo, isNew, wasMaster) {
    }
    onMasterAdded(node, message, rinfo) {
    }
    onNodeAdded(node, message, rinfo) {
    }
    onNodeRemoved(node) {
    }
    start() {
    }
    stop() {
    }
}
exports.NoLeadershipElection = NoLeadershipElection;
//# sourceMappingURL=NoLeadershipElection.js.map