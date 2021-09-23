"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractLeadershipElection = void 0;
const __1 = require("..");
class AbstractLeadershipElection {
    bind(discover) {
        this.discover = discover;
        discover.on(__1.Events.STARTED, this.start.bind(this));
        discover.on(__1.Events.STOPPED, this.stop.bind(this));
        discover.on(__1.Events.ADDED, this.onNodeAdded.bind(this));
        discover.on(__1.Events.REMOVED, this.onNodeRemoved.bind(this));
        discover.on(__1.Events.HELLO_RECEIVED, this.helloReceived.bind(this));
        discover.on(__1.Events.MASTER, this.onMasterAdded.bind(this));
        discover.on(__1.Events.CHECK, this.check.bind(this));
    }
}
exports.AbstractLeadershipElection = AbstractLeadershipElection;
//# sourceMappingURL=AbstractLeadershipElection.js.map