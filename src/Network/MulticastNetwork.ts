import { AbstractNetwork } from "./AbstractNetwork";
import { Destination } from "./Destination";
import { AbstractNetworkOptions } from "./AbstractNetworkOptions";
import { MulticastNetworkOptions } from "./MulticastNetworkOptions";
import { AsyncErrorOnlyCallback } from "../Types/AsyncCallback";
import { createDestination } from "./CreateDestination";

export class MulticastNetwork<EventsType extends Record<string, unknown> = Record<string, unknown>> extends AbstractNetwork<EventsType> {

    protected networkOptions: MulticastNetworkOptions;

    private destinations: Destination[] | null = null;

    public constructor(options: Partial<AbstractNetworkOptions & Pick<MulticastNetworkOptions, "multicastTTL">> & Pick<MulticastNetworkOptions, "multicast">) {
        super(options);

        this.networkOptions = {
            multicast: options.multicast,
            multicastTTL: options.multicastTTL || 1,
        };
    }

    public start(callback?: AsyncErrorOnlyCallback): void {
        super.start(() => {
            const socket = this.getSocket();

            try {
                // addMembership can throw if there are no interfaces available
                socket.addMembership(this.networkOptions.multicast);
                socket.setMulticastTTL(this.networkOptions.multicastTTL);
            } catch (error) {
                this.emit("error", error);

                return callback && callback(error);
            }
        });
    }

    public getDestinations(): Destination[] {
        if (!this.destinations) {
            this.destinations = [this.networkOptions.multicast].map(createDestination);
        }

        return this.destinations;
    }

}
