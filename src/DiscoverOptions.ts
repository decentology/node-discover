import { NetworkOptions } from "./Network/NetworkOptions";
import { LeadershipElectionInterface } from "./Election/LeadershipElectionInterface";
import { LeadershipElectionConstructable } from "./Election/leadershipElectionConstructable";

export interface DiscoverOptions extends NetworkOptions {

    helloInterval: number | (() => number);

    checkInterval: number | (() => number);

    nodeTimeout: number;

    masterTimeout: number;

    mastersRequired: number;

    leadershipElector: LeadershipElectionInterface | LeadershipElectionConstructable | null | false;

    weight: number;

    start: boolean;

    client: boolean;

    server: boolean;

    advertisement: unknown;

}
