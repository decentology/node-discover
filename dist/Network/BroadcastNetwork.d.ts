import { AbstractNetwork } from "./AbstractNetwork";
import { Destination } from "./Destination";
import { AbstractNetworkOptions } from "./AbstractNetworkOptions";
import { BroadcastNetworkOptions } from "./BroadcastNetworkOptions";
import { AsyncErrorOnlyCallback } from "../Types/AsyncCallback";
export declare class BroadcastNetwork<EventsType extends Record<string, unknown> = Record<string, unknown>> extends AbstractNetwork<EventsType> {
    protected networkOptions: BroadcastNetworkOptions;
    private destinations;
    constructor(options?: Partial<AbstractNetworkOptions & BroadcastNetworkOptions>);
    start(callback?: AsyncErrorOnlyCallback): void;
    getDestinations(): Destination[];
}
