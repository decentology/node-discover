import { Node } from "../Discover/Node";
import { Message } from "../Network/Message";
import * as dgram from "dgram";
import { AbstractLeadershipElection } from "./AbstractLeadershipElection";

export class NoLeadershipElection extends AbstractLeadershipElection {

    public check(): void {
    }

    public helloReceived(node: Node, message: Message, rinfo: dgram.RemoteInfo, isNew: boolean, wasMaster: boolean): void {
    }

    public onMasterAdded(node: Node, message: Message, rinfo: dgram.RemoteInfo): void {
    }

    public onNodeAdded(node: Node, message: Message, rinfo: dgram.RemoteInfo): void {
    }

    public onNodeRemoved(node: Node): void {
    }

    public start(): void {
    }

    public stop(): void {
    }

}
