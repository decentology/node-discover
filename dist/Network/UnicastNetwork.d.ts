import { AbstractNetwork } from "./AbstractNetwork";
import { Destination } from "./Destination";
import { AbstractNetworkOptions } from "./AbstractNetworkOptions";
import { UnicastNetworkOptions } from "./UnicastNetworkOptions";
export declare class UnicastNetwork<EventsType extends Record<string, unknown> = Record<string, unknown>> extends AbstractNetwork<EventsType> {
    protected networkOptions: UnicastNetworkOptions;
    private destinations;
    constructor(options: Partial<AbstractNetworkOptions> & UnicastNetworkOptions);
    getDestinations(): Destination[];
}
