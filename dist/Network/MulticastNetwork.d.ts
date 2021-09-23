import { AbstractNetwork } from "./AbstractNetwork";
import { Destination } from "./Destination";
import { AbstractNetworkOptions } from "./AbstractNetworkOptions";
import { MulticastNetworkOptions } from "./MulticastNetworkOptions";
import { AsyncErrorOnlyCallback } from "../Types/AsyncCallback";
export declare class MulticastNetwork<EventsType extends Record<string, unknown> = Record<string, unknown>> extends AbstractNetwork<EventsType> {
    protected networkOptions: MulticastNetworkOptions;
    private destinations;
    constructor(options: Partial<AbstractNetworkOptions & Pick<MulticastNetworkOptions, "multicastTTL">> & Pick<MulticastNetworkOptions, "multicast">);
    start(callback?: AsyncErrorOnlyCallback): void;
    getDestinations(): Destination[];
}
