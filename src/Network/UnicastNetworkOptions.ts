export interface UnicastNetworkOptions {
    /**
     * Comma separated String or Array of Unicast addresses of known nodes
     *
     * It is advised to specify the `address` of the local interface when using unicast and expecting local discovery to work
     */
    unicast: string | string[];
}
