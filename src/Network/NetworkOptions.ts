export interface NetworkOptions {
    address: string;

    port: number;

    broadcast: string | null;

    multicast: string | null;

    multicastTTL: number;

    unicast: string | string[] | null;

    key: string | null;

    exclusive: boolean;

    reuseAddr: boolean;

    ignoreProcess: boolean;

    ignoreInstance: boolean

    hostname: string;
}
