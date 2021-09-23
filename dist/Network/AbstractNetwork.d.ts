/// <reference types="node" />
import { NetworkInterface } from "./NetworkInterface";
import { AbstractNetworkOptions } from "./AbstractNetworkOptions";
import { AsyncCallback, AsyncErrorOnlyCallback, AsyncNoopCallback } from "../Types/AsyncCallback";
import dgram from "dgram";
import { Message } from "./Message";
import { EventEmitter } from "events";
import { Destination } from "./Destination";
export declare abstract class AbstractNetwork<EventsType extends Record<string, unknown> = Record<string, unknown>> extends EventEmitter implements NetworkInterface<EventsType> {
    protected options: AbstractNetworkOptions;
    protected socket: dgram.Socket | null;
    constructor(options?: Partial<AbstractNetworkOptions>);
    send<EventName extends keyof EventsType>(event: EventName, data: Message<EventsType[EventName] | unknown>): void;
    start(callback?: AsyncErrorOnlyCallback): void;
    stop(callback?: AsyncNoopCallback): void;
    abstract getDestinations(): Destination[];
    protected getSocket(): dgram.Socket;
    protected decode<T>(data: Buffer, callback: AsyncCallback<T>): void;
    protected encode(data: unknown, callback: AsyncCallback<string>): void;
}
