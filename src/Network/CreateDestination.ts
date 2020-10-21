import { Destination } from "./Destination";

export function createDestination(address: string, port?: number): Destination {

    if (!port) {
        if (~address.indexOf(":")) {
            const tokens = address.split(":");

            address = tokens[0];
            port = parseInt(tokens[1], 10);
        }
    }

    return {
        address,
        port,
    };
}
