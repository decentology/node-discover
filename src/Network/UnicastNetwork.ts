import { AbstractNetwork } from "./AbstractNetwork";
import { Destination } from "./Destination";
import { AbstractNetworkOptions } from "./AbstractNetworkOptions";
import { UnicastNetworkOptions } from "./UnicastNetworkOptions";
import { createDestination } from "./CreateDestination";

export class UnicastNetwork<EventsType extends Record<string, unknown> = Record<string, unknown>> extends AbstractNetwork<EventsType> {

    protected networkOptions: UnicastNetworkOptions;

    private destinations: Destination[] | null = null;

    public constructor(options: Partial<AbstractNetworkOptions> & UnicastNetworkOptions) {
        super(options);

        this.networkOptions = {
            unicast: options.unicast,
        };
    }

    public getDestinations(): Destination[] {
        if (!this.destinations) {
            let unicast = this.networkOptions.unicast;

            if (typeof unicast === "string" && ~unicast.indexOf(",")) {
                unicast = unicast.split(",");
            }

            this.destinations = [...unicast].map(createDestination);
        }

        return this.destinations;
    }

}
