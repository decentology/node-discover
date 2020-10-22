import { Message } from "./Message";

export interface NetworkMessage<DataType> extends Message<DataType> {
    pid: string;

    hostname: string;

    event: string;
}
