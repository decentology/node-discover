/// <reference types="node" />
import { LeadershipElectionInterface } from "./LeadershipElectionInterface";
import { Discover, Message, Node } from "..";
import * as dgram from "dgram";
export declare abstract class AbstractLeadershipElection implements LeadershipElectionInterface {
    protected discover: Discover;
    abstract check(): void;
    abstract helloReceived(node: Node, message: Message, rinfo: dgram.RemoteInfo, isNew: boolean, wasMaster: boolean): void;
    abstract onMasterAdded(node: Node, message: Message, rinfo: dgram.RemoteInfo): void;
    abstract onNodeAdded(node: Node, message: Message, rinfo: dgram.RemoteInfo): void;
    abstract onNodeRemoved(node: Node): void;
    abstract start(): void;
    abstract stop(): void;
    bind(discover: Discover): void;
}
