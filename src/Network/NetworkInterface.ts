import { AsyncErrorOnlyCallback, AsyncNoopCallback } from "../Types/AsyncCallback";
import { Destination } from "./Destination";
import { Message } from "./Message";
import { EventEmitter } from "events";

export interface NetworkInterface<EventsType extends Record<string, unknown> = Record<string, unknown>> extends EventEmitter {

    start(callback?: AsyncErrorOnlyCallback): void;

    stop(callback?: AsyncNoopCallback): void;

    send<EventName extends keyof EventsType>(event: EventName, data: Message<EventsType[EventName] | unknown>): void;

    getDestinations(): Destination[];

}
