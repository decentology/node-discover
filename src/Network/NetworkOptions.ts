/**
 * @category Network
 */
export interface NetworkOptions {
    /**
     * Address to bind to
     *
     * @default 0.0.0.0
     */
    address: string;

    /**
     * Port on which to bind and communicate with other node-discover processes
     *
     * @default 12345
     */
    port: number;

    /**
     * Broadcast address if using broadcast
     *
     * 255.255.255.255
     */
    broadcast: string | null;

    /**
     * Multicast address if using multicast
     *
     * @default null (don't use multicast, use broadcast)
     */
    multicast: string | null;

    /**
     * Multicast TTL for when using multicast
     *
     * @default 1
     */
    multicastTTL: number;

    /**
     * Comma separated String or Array of Unicast addresses of known nodes
     *
     * It is advised to specify the `address` of the local interface when using unicast and expecting local discovery to work
     */
    unicast: string | string[] | null;

    /**
     * Encryption key if your broadcast packets should be encrypted
     *
     * @default null (that means no encryption)
     */
    key: string | null;

    exclusive: boolean;

    /**
     * Allow multiple processes on the same host to bind to the same address and port.
     *
     * @default true
     */
    reuseAddr: boolean;

    /**
     * If set to false, will not ignore messages from other Discover instances within the same process (on non-reserved channels), join() will receive them.
     *
     * @default true
     */
    ignoreProcess: boolean;

    /**
     * If set to false, will not ignore messages from self (on non-reserved channels), join() will receive them.
     *
     * @default true
     */
    ignoreInstance: boolean

    /**
     * Override the OS hostname with a custom value.
     *
     * @default DISCOVERY_HOSTNAME env var or OS hostname
     */
    hostname: string;
}
