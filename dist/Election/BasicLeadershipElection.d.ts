/// <reference types="node" />
import { Node } from "../Discover/Node";
import { Message } from "../Network/Message";
import * as dgram from "dgram";
import { AbstractLeadershipElection } from "./AbstractLeadershipElection";
export declare class BasicLeadershipElection extends AbstractLeadershipElection {
    check(): void;
    helloReceived(node: Node, message: Message, rinfo: dgram.RemoteInfo, isNew: boolean, wasMaster: boolean): void;
    onMasterAdded(node: Node, message: Message, rinfo: dgram.RemoteInfo): void;
    onNodeAdded(node: Node, message: Message, rinfo: dgram.RemoteInfo): void;
    onNodeRemoved(node: Node): void;
    start(): void;
    stop(): void;
}
