export interface AbstractNetworkOptions {
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
     * Encryption key if your broadcast packets should be encrypted
     *
     * @default null (that means no encryption)
     */
    key: string | null;
    /**
     * When exclusive is set to false, cluster workers will use the same underlying socket handle allowing connection handling duties to be shared.
     * When exclusive is true, however, the handle is not shared and attempted port sharing results in an error.
     *
     * @default false
     */
    exclusive: boolean;
    /**
     * Allow multiple processes on the same host to bind to the same address and port.
     *
     * @default true
     */
    reuseAddr: boolean;
    /**
     * Override the OS hostname with a custom value.
     *
     * @default DISCOVERY_HOSTNAME env var or OS hostname
     */
    hostname: string;
}
