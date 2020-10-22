import { AbstractNetwork } from "./AbstractNetwork";
import { Destination } from "./Destination";
import { AbstractNetworkOptions } from "./AbstractNetworkOptions";
import { BroadcastNetworkOptions } from "./BroadcastNetworkOptions";
import { AsyncErrorOnlyCallback } from "../Types/AsyncCallback";
import { createDestination } from "./CreateDestination";

export class BroadcastNetwork<EventsType extends Record<string, unknown> = Record<string, unknown>> extends AbstractNetwork<EventsType> {

    protected networkOptions: BroadcastNetworkOptions;

    private destinations: Destination[] | null = null;

    public constructor(options: Partial<AbstractNetworkOptions & BroadcastNetworkOptions> = {}) {
        super(options);

        this.networkOptions = {
            broadcast: options.broadcast || "255.255.255.255",
        };
    }

    public start(callback?: AsyncErrorOnlyCallback): void {
        super.start(() => {
            const socket = this.getSocket();
            socket.setBroadcast(true);

            callback && callback(null);
        });
    }

    public getDestinations(): Destination[] {
        if (!this.destinations) {
            //TODO: get the default broadcast address from os.networkInterfaces() (not currently returned)
            this.destinations = [this.networkOptions.broadcast || "255.255.255.255"].map(createDestination);
        }

        return this.destinations;
    }

}
