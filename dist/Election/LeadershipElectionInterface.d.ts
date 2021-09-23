/// <reference types="node" />
import { Node } from "../Discover/Node";
import * as dgram from "dgram";
import { Message } from "../Network/Message";
import { Discover } from "../Discover/Discover";
export interface LeadershipElectionInterface {
    onNodeAdded(node: Node, message: Message, rinfo: dgram.RemoteInfo): void;
    onNodeRemoved(node: Node): void;
    onMasterAdded(node: Node, message: Message, rinfo: dgram.RemoteInfo): void;
    helloReceived(node: Node, message: Message, rinfo: dgram.RemoteInfo, isNew: boolean, wasMaster: boolean): void;
    check(): void;
    start(discover: Discover): void;
    stop(): void;
    bind(discover: Discover): void;
}
