"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicLeadershipElection = void 0;
const AbstractLeadershipElection_1 = require("./AbstractLeadershipElection");
class BasicLeadershipElection extends AbstractLeadershipElection_1.AbstractLeadershipElection {
    check() {
        let mastersFound = 0;
        let higherWeightMasters = 0;
        let higherWeightFound = false;
        const me = this.discover.getMe();
        const nodes = this.discover.getNodes();
        const options = this.discover.getOptions();
        const ids = Object.keys(nodes);
        for (const id of ids) {
            const node = nodes[id];
            if (node.isMaster && (+new Date() - node.lastSeen) < options.masterTimeout) {
                mastersFound++;
                if (node.weight > me.weight) {
                    higherWeightMasters += 1;
                }
            }
            if (node.weight > me.weight && node.isMasterEligible && !node.isMaster) {
                higherWeightFound = true;
            }
        }
        const iAmMaster = me.isMaster;
        if (iAmMaster && higherWeightMasters >= options.mastersRequired) {
            this.discover.demote();
        }
        if (!iAmMaster && mastersFound < options.mastersRequired && me.isMasterEligible && !higherWeightFound) {
            //no masters found out of all our nodes, become one.
            this.discover.promote();
        }
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
exports.BasicLeadershipElection = BasicLeadershipElection;
//# sourceMappingURL=BasicLeadershipElection.js.map