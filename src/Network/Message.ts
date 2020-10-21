export interface Message<DataType = unknown> {
    pid: string;

    iid: string;

    hostname: string;

    event: string;

    data: DataType;
}
