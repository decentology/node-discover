import { NetworkInterface } from "./NetworkInterface";
import { AbstractNetworkOptions } from "./AbstractNetworkOptions";
import { AsyncCallback, AsyncErrorOnlyCallback, AsyncNoopCallback } from "../Types/AsyncCallback";
import os from "os";
import dgram from "dgram";
import { Message } from "./Message";
import { PROCESS_UUID } from "../internal";
import { EventEmitter } from "events";
import { Security } from "../Security";
import { Destination } from "./Destination";
import { NetworkMessage } from "./NetworkMessage";
import { NetworkEvents } from "./NetworkEvents";

export abstract class AbstractNetwork<EventsType extends Record<string, unknown> = Record<string, unknown>> extends EventEmitter implements NetworkInterface<EventsType> {

    protected options: AbstractNetworkOptions;

    protected socket: dgram.Socket | null = null;

    public constructor(options: Partial<AbstractNetworkOptions> = {}) {
        super();
        this.options = {
            address: "0.0.0.0",
            port: 12345,
            key: null,
            exclusive: false,
            reuseAddr: true,
            hostname: process.env.DISCOVERY_HOSTNAME ?? os.hostname(),
            ...options,
        };
    }

    public send<EventName extends keyof EventsType>(event: EventName, data: Message<EventsType[EventName] | unknown>): void {
        const message: NetworkMessage<EventsType[EventName] | unknown> = {
            event: event as string,
            hostname: this.options.hostname,
            pid: PROCESS_UUID,
            ...data,
        };

        if (!this.socket) {
            throw new Error("RuntimeException: Network not started, start network first to send data.");
        }

        const socket = this.getSocket();

        this.encode(message, (error: Error | null, contents: string | null) => {
            if (error) {
                this.emit("error", error);
                return;
            }

            if (contents) {
                const encodedMessage = Buffer.from(contents);
                const destinations = this.getDestinations();

                for (const destination of destinations) {
                    socket.send(encodedMessage, 0, encodedMessage.length, destination.port || this.options.port, destination.address);
                }
            }
        });
    }

    public start(callback?: AsyncErrorOnlyCallback): void {
        const socket = this.getSocket();

        socket.on("message", (data: Buffer, rinfo: dgram.RemoteInfo) => {
            this.decode<NetworkMessage<unknown>>(data, (error: Error | null, message: NetworkMessage<unknown> | null) => {
                if (error) {
                    //most decode errors are because we tried
                    //to decrypt a packet for which we do not
                    //have the key

                    //the only other possibility is that the
                    //message was split across packet boundaries
                    //and that is not handled

                    //self.emit("error", err);
                    // @todo
                }

                if (message) {
                    this.emit(NetworkEvents.MESSAGE, message, rinfo);
                }
            });
        });

        this.on("error", function (error) {
            //TODO: Deal with this
            /*console.log("Network error: ", err.stack);*/
        });

        const bindOptions = {
            port : this.options.port,
            address : this.options.address,
            exclusive : this.options.exclusive
        };

        socket.bind(bindOptions, () => {
            callback && callback(null);
        });
    }

    public stop(callback?: AsyncNoopCallback): void {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }

        return callback && callback();
    }

    public abstract getDestinations(): Destination[];

    protected getSocket() {
        if (!this.socket) {
            this.socket = dgram.createSocket({ type: "udp4", reuseAddr: this.options.reuseAddr });
        }

        return this.socket;
    }

    protected decode<T>(data: Buffer, callback: AsyncCallback<T>) {
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

    protected encode(data: unknown, callback: AsyncCallback<string>) {
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
