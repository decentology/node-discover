import { LeadershipElectionInterface } from "./LeadershipElectionInterface";
import { Discover, Events, Message, Node } from "..";
import * as dgram from "dgram";

export abstract class AbstractLeadershipElection implements LeadershipElectionInterface {

    protected discover!: Discover;

    public abstract check(): void;

    public abstract helloReceived(node: Node, message: Message, rinfo: dgram.RemoteInfo, isNew: boolean, wasMaster: boolean): void;

    public abstract onMasterAdded(node: Node, message: Message, rinfo: dgram.RemoteInfo): void;

    public abstract onNodeAdded(node: Node, message: Message, rinfo: dgram.RemoteInfo): void;

    public abstract onNodeRemoved(node: Node): void;

    public abstract start(): void;

    public abstract stop(): void;

    public bind(discover: Discover) {
        this.discover = discover;

        discover.on(Events.STARTED, this.start.bind(this));
        discover.on(Events.STOPPED, this.stop.bind(this));

        discover.on(Events.ADDED, this.onNodeAdded.bind(this));
        discover.on(Events.REMOVED, this.onNodeRemoved.bind(this));
        discover.on(Events.HELLO_RECEIVED, this.helloReceived.bind(this));
        discover.on(Events.MASTER, this.onMasterAdded.bind(this));
        discover.on(Events.CHECK, this.check.bind(this));

    }

}
