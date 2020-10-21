import { NetworkOptions } from "./NetworkOptions";
import { EventEmitter } from "events";
import * as dgram from "dgram";
import { v4 as uuidv4 } from "uuid";
import { Message } from "./Message";
import { Destination } from "./Destination";
import { Security } from "../Security";
import { AsyncCallback, AsyncErrorCallback } from "../Types/AsyncCallback";
import { DEFAULT_NETWORK_OPTIONS, NODE_VERSION, PROCESS_UUID } from "../globals";

export class Network extends EventEmitter {
    private options: NetworkOptions;

    private socket: dgram.Socket;

    private instanceUuid: string = uuidv4();

    private processUuid: string = PROCESS_UUID;

    private destinations: Destination[] = [];

    public constructor(options: Partial<NetworkOptions> = {}) {
        super();

        this.options = {
            ...DEFAULT_NETWORK_OPTIONS,
            ...options,
        };

        if (NODE_VERSION[0] === 0 && NODE_VERSION[1] < 12) {
            //node v0.10 does not support passing an object to dgram.createSocket
            //not sure if v0.11 does, but assuming it does not.
            this.socket = dgram.createSocket("udp4");
        } else {
            this.socket = dgram.createSocket({ type: "udp4", reuseAddr: this.options.reuseAddr });
        }

        this.socket.on("message", (data: Buffer, rinfo: dgram.RemoteInfo) => {
            this.decode<Message>(data, (error: Error | null, message: Message | null) => {
                if (error) {
                    //most decode errors are because we tried
                    //to decrypt a packet for which we do not
                    //have the key

                    //the only other possibility is that the
                    //message was split across packet boundaries
                    //and that is not handled

                    //self.emit("error", err);
                }

                if (message) {
                    if (message.pid == this.processUuid && this.options.ignoreProcess && message.iid !== this.instanceUuid) {
                        return false;
                    } else if (message.iid == this.instanceUuid && this.options.ignoreInstance) {
                        return false;
                    } else if (message.event && message.data) {
                        this.emit(message.event, message.data, message, rinfo);
                    } else {
                        this.emit("message", message);
                    }
                }
            });
        });

        this.on("error", function (error) {
            //TODO: Deal with this
            /*console.log("Network error: ", err.stack);*/
        });
    }

    public getInstanceUuid(): string {
        return this.instanceUuid;
    }

    public start(callback: AsyncCallback<null>) {
        const options = {
            port: this.options.port,
            address: this.options.address,
            exclusive: this.options.exclusive,
        };

        this.socket.bind(options, () => {
            const destinations = this.getDestinations(callback);

            if (!destinations) {
                return;
            }

            //make sure each destination is a Destination instance
            this.destinations = destinations.map(destination => new Destination(destination));

            return callback && callback(null, null);
        });
    }

    public send(event: string, data: unknown): void {
        const message: Message = {
            event,
            pid: PROCESS_UUID,
            iid: this.instanceUuid,
            hostname: this.options.hostname,
            data,
        };

        this.encode(message, (error: Error | null, contents: string | null) => {
            if (error) {
                return false;
            }

            if (contents) {
                const msg = Buffer.from(contents);

                for (const destination of this.destinations) {
                    this.socket.send(msg, 0, msg.length, destination.port || this.options.port, destination.address);
                }
            }
        });
    }

    public stop(callback?: AsyncCallback<null>) {
        this.socket.close();

        return callback && callback(null, null);
    }

    private getDestinations(callback: AsyncErrorCallback) {
        if (this.options.unicast) {
            if (typeof this.options.unicast === "string" && ~this.options.unicast.indexOf(",")) {
                this.options.unicast = this.options.unicast.split(",");
            }

            return [...this.options.unicast];
        } else if (!this.options.multicast) {
            //Default to using broadcast if multicast address is not specified.
            this.socket.setBroadcast(true);

            //TODO: get the default broadcast address from os.networkInterfaces() (not currently returned)
            return [this.options.broadcast || "255.255.255.255"];
        } else {
            try {
                // addMembership can throw if there are no interfaces available
                this.socket.addMembership(this.options.multicast);
                this.socket.setMulticastTTL(this.options.multicastTTL);
            } catch (error) {
                this.emit("error", error);

                return callback && callback(error, null);
            }

            return [this.options.multicast];
        }
    }

    private decode<T>(data: Buffer, callback: AsyncCallback<T>) {
        const stringified = data.toString();

        try {
            if (this.options.key) {
                const decrypted = Security.decrypt(stringified, this.options.key);
                const parsed = JSON.parse(decrypted);

                return callback(null, parsed);
            }

            const parsed = JSON.parse(stringified);

            return callback(null, parsed);

        } catch (error) {
            return callback(error, null);
        }
    }

    private encode(data: unknown, callback: AsyncCallback<string>) {
        const stringified = JSON.stringify(data);

        if (this.options.key) {
            try {
                const encrypted = Security.encrypt(stringified, this.options.key);

                return callback(null, encrypted);
            } catch (error) {
                return callback(error, null);
            }
        }

        return callback(null, stringified);
    }
}
