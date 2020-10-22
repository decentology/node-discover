import { Node } from "../Discover/Node";
import { Message } from "../Network/Message";
import * as dgram from "dgram";
import { AbstractLeadershipElection } from "./AbstractLeadershipElection";

export class BasicLeadershipElection extends AbstractLeadershipElection {

    public check(): void {
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
