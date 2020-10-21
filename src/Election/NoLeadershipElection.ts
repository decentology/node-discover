import { LeadershipElectionInterface } from "./LeadershipElectionInterface";
import { Node } from "../Types/Node";
import { Message } from "../Network/Message";
import * as dgram from "dgram";

/**
 * @category Election
 */
export class NoLeadershipElection implements LeadershipElectionInterface {
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
