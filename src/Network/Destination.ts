export class Destination {

    public address: string;

    public port?: number;

    public constructor(address: string, port?: number) {

        if (!port) {
            if (~address.indexOf(":")) {
                const tokens = address.split(":");

                address = tokens[0];
                port = parseInt(tokens[1], 10);
            }
        }

        this.address = address;
        this.port = port;
    }
}
