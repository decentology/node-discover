import { NetworkOptions } from "./Network/NetworkOptions";
import { LeadershipElectionInterface } from "./Election/LeadershipElectionInterface";
import { LeadershipElectionConstructable } from "./Election/LeadershipElectionConstructable";

export interface DiscoverOptions extends NetworkOptions {

    /**
     * How often to broadcast a hello packet in milliseconds
     *
     * @default 1000
     */
    helloInterval: number | (() => number);

    /**
     * How often to to check for missing nodes in milliseconds
     *
     * @default 2000
     */
    checkInterval: number | (() => number);

    /**
     * Consider a node dead if not seen in this many milliseconds
     *
     * @default 2000
     */
    nodeTimeout: number;

    /**
     * Consider a master node dead if not seen in this many milliseconds
     *
     * @default 2000
     */
    masterTimeout: number;

    /**
     * The count of master processes that should always be available
     *
     * @default 1
     */
    mastersRequired: number;

    leadershipElector: LeadershipElectionInterface | LeadershipElectionConstructable | null | false;

    /**
     * A number used to determine the preference for a specific process to become master
     * Higher numbers win.
     *
     * @default Discover.weight()
     */
    weight: number;

    start: boolean;

    /**
     * When true operate in client only mode (don't broadcast existence of node, just listen and discover)
     *
     * @default false
     */
    client: boolean;

    server: boolean;

    /**
     * The initial advertisement object which is sent with each hello packet.
     */
    advertisement: unknown;

}
