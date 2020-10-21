import { LeadershipElectionInterface } from "./LeadershipElectionInterface";
import { Discover } from "../Discover";
import { BasicLeadershipElection } from "./BasicLeadershipElection";
import { LeadershipElectionConstructable } from "./LeadershipElectionConstructable";
import { Events } from "../Events";

/**
 * @internal
 * @hidden
 */
export function resolveLeadership(leadershipElector: LeadershipElectionInterface | LeadershipElectionConstructable | null | false, discover: Discover) {
    let elector: LeadershipElectionInterface;

    if (typeof leadershipElector === "boolean") {
        return;
    }

    if (!leadershipElector) {
        elector = new BasicLeadershipElection(discover);
    } else if (typeof leadershipElector == "object") {
        //assume an instance of a leadership elector
        elector = leadershipElector;
    } else {
        elector = new leadershipElector(discover);
    }

    discover.on("started", elector.start.bind(elector));
    discover.on("stopped", elector.stop.bind(elector));

    discover.on(Events.ADDED, elector.onNodeAdded.bind(elector));
    discover.on(Events.REMOVED, elector.onNodeRemoved.bind(elector));
    discover.on(Events.HELLO_RECEIVED, elector.helloReceived.bind(elector));
    discover.on(Events.MASTER, elector.onMasterAdded.bind(elector));
    discover.on("check", elector.check.bind(elector));

    return elector;
}
